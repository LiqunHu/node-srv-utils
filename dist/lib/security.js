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
const crypto_1 = require("crypto");
const jsonwebtoken_1 = require("jsonwebtoken");
const redisClient_1 = __importDefault(require("./redisClient"));
let logger = console;
let config;
function setLogger(createLogger) {
    logger = createLogger(__filename);
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
function tokenVerify(req) {
    return __awaiter(this, void 0, void 0, function* () {
        let token_str = req.cookies['Authorization'] || req.header('Authorization');
        if (!token_str) {
            logger.debug('no token');
            return null;
        }
        try {
            let tokenData = (yield (0, jsonwebtoken_1.verify)(token_str, config.SECRET_KEY));
            tokenData.token = token_str;
            return tokenData;
        }
        catch (error) {
            return null;
        }
    });
}
function token2user(req) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let tokenData = yield tokenVerify(req);
            if (!tokenData) {
                return -1;
            }
            let token = tokenData.token, expires = tokenData.exp, type = tokenData.type, user_id = tokenData.user_id;
            if (expires < Date.now() / 1000) {
                logger.debug('expires');
                return -3;
            }
            let authData = yield redisClient_1.default.get(['AUTH', type, user_id].join('_'));
            if (authData) {
                let user = authData.user;
                if (!user) {
                    logger.debug('user do not exist');
                    return -1;
                }
                req.user = user;
                if (authData.session_token != token) {
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
                return -3;
            }
            return -1;
        }
        catch (error) {
            logger.error(error);
            return -1;
        }
    });
}
function aesDecryptModeCBC(msg, pwd) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let encrypted = Buffer.from(msg, 'base64');
            let key = Buffer.from(pwd, 'hex');
            let iv = new Uint8Array(16);
            iv[0] = 1;
            const key_encoded = yield crypto_1.webcrypto.subtle.importKey('raw', key, 'AES-CBC', false, ['encrypt', 'decrypt']);
            const decrypted = yield crypto_1.webcrypto.subtle.encrypt({
                name: 'AES-CBC',
                iv: iv,
            }, key_encoded, encrypted);
            const dec = new TextDecoder('utf-8');
            return dec.decode(decrypted);
        }
        catch (error) {
            return '';
        }
    });
}
exports.default = {
    setLogger,
    setSecureConfig,
    user2token,
    tokenVerify,
    token2user,
    aesDecryptModeCBC,
};
