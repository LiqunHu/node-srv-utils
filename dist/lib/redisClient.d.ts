/// <reference types="node" />
import { RedisOptions, RedisKey, RedisValue } from 'ioredis';
declare function initClient(config: RedisOptions): void;
declare function set(key: RedisKey, value: any, expiryMode?: 'NX' | 'XX' | 'PX' | 'EX', time?: number | string): Promise<void>;
declare function get(key: RedisKey): Promise<any>;
declare function del(key: RedisKey): Promise<void>;
declare function hmset(key: RedisKey, data: Map<string, RedisValue> | RedisValue[] | {
    [key: string]: RedisValue;
}): Promise<void>;
declare function hset(key: RedisKey, data: any[] | {
    [key: string]: any;
} | Map<string, RedisValue>): Promise<void>;
declare function hgetall(key: RedisKey): Promise<Record<string, string>>;
declare function hget(key: RedisKey, field: string): Promise<string>;
declare function hdel(key: RedisKey, ...args: (string | Buffer)[]): Promise<void>;
declare function ttl(key: RedisKey): Promise<number>;
declare const _default: {
    initClient: typeof initClient;
    set: typeof set;
    get: typeof get;
    del: typeof del;
    hmset: typeof hmset;
    hset: typeof hset;
    hgetall: typeof hgetall;
    hget: typeof hget;
    hdel: typeof hdel;
    ttl: typeof ttl;
};
export default _default;
