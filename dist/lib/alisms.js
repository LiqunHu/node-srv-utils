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
const pop_core_1 = __importDefault(require("@alicloud/pop-core"));
let logger = console;
let client;
function setLogger(createLogger) {
    logger = createLogger(__filename);
}
function initAlicloud(config) {
    client = new pop_core_1.default({
        accessKeyId: config.accessKeyId,
        accessKeySecret: config.accessKeySecret,
        endpoint: 'https://dysmsapi.aliyuncs.com',
        apiVersion: '2017-05-25',
    });
}
function sendSms(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield client.request('SendSms', params, { method: 'POST' });
        logger.debug(result);
    });
}
exports.default = {
    setLogger,
    initAlicloud,
    sendSms
};
