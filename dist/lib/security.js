"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_js_1 = __importDefault(require("crypto-js"));
const jsonwebtoken_1 = require("jsonwebtoken");
const redisClient_1 = __importDefault(require("./redisClient"));
let logger = console;
let config;
function setLogger(appointLogger) {
    logger = appointLogger.createLogger(__filename);
}
function setSecureConfig(cfg) {
    config = cfg;
}
function user2token(type, userId) {
    try {
        let expires;
        if (type === 'MOBILE' || type === 'OA' || type === 'MP') {
            expires = config.MOBILE_TOKEN_AGE;
        }
        else if (type === 'SYSTEM') {
            expires = config.SYSTEM_TOKEN_AGE;
        }
        else {
            expires = config.TOKEN_AGE;
        }
        let token = (0, jsonwebtoken_1.sign)({ type: type, user_id: userId }, config.SECRET_KEY, {
            expiresIn: expires,
        });
        return token;
    }
    catch (error) {
        logger.error(error);
        return null;
    }
}
function token2user(req) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let token_str = req.cookies['Authorization'] ||
                (req.header('Authorization')
                    ? req.header('Authorization').split('Bearer ')[1]
                    : null);
            if (!token_str) {
                logger.debug('no token');
                return -1;
            }
            let tokensplit = token_str.split('_');
            if (tokensplit.length != 2) {
                return -1;
            }
            let token = tokensplit[0], expires = tokensplit[1];
            if (parseInt(expires) < Date.now()) {
                logger.debug('expires');
                return -3;
            }
            const { type, user_id } = (yield (0, jsonwebtoken_1.verify)(token, config.SECRET_KEY));
            let authData = yield redisClient_1.default.get(['AUTH', type, user_id].join('_'));
            if (authData) {
                let user = authData.user;
                if (!user) {
                    logger.debug('user do not exist');
                    return -1;
                }
                req.user = user;
                if (authData.session_token != token_str) {
                    logger.debug('login from other place');
                    return -2;
                }
                let patha = req.path.split('/');
                let func = patha[patha.length - 2].toUpperCase();
                // if (
                //   config.syslogFlag &&
                //   func !== 'AUTH' &&
                //   method !== 'init' &&
                //   method !== 'search' &&
                //   method.search(/search/i) < 0
                // ) {
                //   tb_common_userlog.create({
                //     user_id: user.user_id,
                //     api_function: func,
                //     userlog_method: method,
                //     userlog_para: JSON.stringify(req.body)
                //   })
                // }
                let apiList = authData.authApis;
                //auth control
                let apis = {};
                for (let m of apiList) {
                    apis[m.api_function] = '';
                }
                if (func in apis) {
                    return 0;
                }
            }
            else {
                logger.error('Redis get authData failed');
                return -1;
            }
            return -1;
        }
        catch (error) {
            logger.error(error);
            return -1;
        }
    });
}
function aesDecryptModeCFB(msg, pwd, magicNo) {
    let key = crypto_js_1.default.enc.Hex.parse(pwd);
    let iv = crypto_js_1.default.enc.Hex.parse(magicNo);
    let decrypted = crypto_js_1.default.AES.decrypt(msg, key, {
        iv: iv,
        mode: crypto_js_1.default.mode.CBC,
        padding: crypto_js_1.default.pad.Pkcs7,
    }).toString(crypto_js_1.default.enc.Utf8);
    return decrypted;
}
exports.default = {
    setLogger,
    setSecureConfig,
    user2token,
    token2user,
    aesDecryptModeCFB,
};
