"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleJob = exports.redisClient = exports.authority = exports.alisms = exports.setLogger = void 0;
const redisClient_1 = __importDefault(require("./lib/redisClient"));
exports.redisClient = redisClient_1.default;
const authority_1 = __importDefault(require("./lib/authority"));
exports.authority = authority_1.default;
const alisms_1 = __importDefault(require("./lib/alisms"));
exports.alisms = alisms_1.default;
const scheduleJob_1 = __importDefault(require("./lib/scheduleJob"));
exports.scheduleJob = scheduleJob_1.default;
function setLogger(appointLogger) {
    alisms_1.default.setLogger(appointLogger);
    authority_1.default.setLogger(appointLogger);
    scheduleJob_1.default.setLogger(appointLogger);
}
exports.setLogger = setLogger;
