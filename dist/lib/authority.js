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
const lodash_1 = __importDefault(require("lodash"));
const redisClient_1 = __importDefault(require("./redisClient"));
const security_1 = __importDefault(require("./security"));
let logger = console;
let dbhandle;
function setLogger(createLogger) {
    logger = createLogger(__filename);
}
function initMiddleware(dbhandle, config) {
    dbhandle = dbhandle;
    security_1.default.setSecureConfig(config);
}
function authMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let apis = yield redisClient_1.default.get('AUTHAPI');
            if (lodash_1.default.isEmpty(apis)) {
                let apiList = yield dbhandle('select api_function, auth_flag from tbl_common_api where state = "1" and api_function != ""', []);
                for (let a of apiList) {
                    apis[a.api_function] = a.auth_flag;
                }
            }
            let patha = req.path.split('/');
            let func = patha[patha.length - 2].toUpperCase();
            let checkresult = yield security_1.default.token2user(req);
            if (func in apis) {
                if (apis[func] === '1') {
                    if (checkresult != 0) {
                        if (checkresult === -2) {
                            logger.info('UNAUTHORIZED');
                            return res.status(401).send({
                                errno: -2,
                                msg: 'Login from other place',
                            });
                        }
                        else {
                            logger.info('UNAUTHORIZED');
                            return res.status(401).send({
                                errno: -1,
                                msg: 'Auth Failed or session expired',
                            });
                        }
                    }
                }
            }
            else {
                if (func != 'AUTH') {
                    logger.info('UNAUTHORIZED');
                    return res.status(401).send({
                        errno: -1,
                        msg: 'Auth Failed or session expired',
                    });
                }
            }
        }
        catch (error) {
            let sendData = {};
            if (process.env.NODE_ENV === 'dev') {
                sendData = {
                    errno: -1,
                    msg: error.stack,
                };
            }
            else {
                sendData = {
                    errno: -1,
                    msg: 'Internal Error',
                };
            }
            return res.status(500).send(sendData);
        }
        next();
    });
}
exports.default = {
    setLogger,
    initMiddleware,
    authMiddleware,
    aesDecryptModeCFB: security_1.default.aesDecryptModeCFB,
    user2token: security_1.default.user2token,
    tokenVerify: security_1.default.tokenVerify,
};
