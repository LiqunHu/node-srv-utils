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
const ioredis_1 = __importDefault(require("ioredis"));
let client;
let cluster;
function initClient(config) {
    client = new ioredis_1.default(config);
}
function initCluster(nodes, options) {
    cluster = new ioredis_1.default.Cluster(nodes, options);
}
/* expiryMode
EX seconds -- Set the specified expire time, in seconds.
PX milliseconds -- Set the specified expire time, in milliseconds.
NX -- Only set the key if it does not already exist.
XX -- Only set the key if it already exist.
KEEPTTL -- Retain the time to live associated with the key
*/
function set(key, value, expiryMode, time) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!!expiryMode) {
            if (expiryMode == 'NX') {
                yield client.set(key, JSON.stringify(value), 'NX');
            }
            else if (expiryMode == 'XX') {
                yield client.set(key, JSON.stringify(value), 'XX');
            }
            else if (expiryMode == 'EX') {
                yield client.set(key, JSON.stringify(value), 'EX', time);
            }
            else if (expiryMode == 'PX') {
                yield client.set(key, JSON.stringify(value), 'PX', time);
            }
        }
        else {
            yield client.set(key, JSON.stringify(value));
        }
    });
}
function get(key) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield client.get(key);
        if (result) {
            return JSON.parse(result);
        }
        else {
            return null;
        }
    });
}
function del(key) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.del(key);
    });
}
function hmset(key, data) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.hmset(key, data);
    });
}
function hset(key, data) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.hset(key, data);
    });
}
function hgetall(key) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield client.hgetall(key);
        return result;
    });
}
function hget(key, field) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield client.hget(key, field);
        return result;
    });
}
function hdel(key, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.hdel(key, ...args);
    });
}
function ttl(key) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield client.ttl(key);
        return result;
    });
}
exports.default = {
    initClient,
    set,
    get,
    del,
    hmset,
    hset,
    hgetall,
    hget,
    hdel,
    ttl,
};
