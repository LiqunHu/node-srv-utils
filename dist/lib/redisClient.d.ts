import { RedisOptions, KeyType, ValueType } from 'ioredis';
declare function initClient(config: RedisOptions): void;
declare function set(key: KeyType, value: any, expiryMode?: string | any[], time?: number | string, setMode?: number | string): Promise<void>;
declare function get(key: KeyType): Promise<any>;
declare function del(key: KeyType): Promise<void>;
declare function hmset(key: KeyType, data: Map<string, ValueType> | ValueType[] | {
    [key: string]: ValueType;
}): Promise<void>;
declare function hset(key: KeyType, data: any[] | {
    [key: string]: any;
} | Map<string, ValueType>): Promise<void>;
declare function hgetall(key: KeyType): Promise<Record<string, string>>;
declare function hget(key: KeyType, field: string): Promise<string>;
declare function hdel(key: KeyType, args: KeyType[]): Promise<void>;
declare function ttl(key: KeyType): Promise<number>;
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
