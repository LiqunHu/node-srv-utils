import { Request } from 'express';
export interface SecureConfig {
    SECRET_KEY: string;
    TOKEN_AGE: number;
    MOBILE_TOKEN_AGE: number;
    SYSTEM_TOKEN_AGE: number;
}
export interface DataStoredInToken {
    type: string;
    user_id: string;
    exp: number;
    token?: string;
}
declare function setLogger(createLogger: any): void;
declare function setSecureConfig(cfg: SecureConfig): void;
declare function user2token(type: string, userId: string): string | null;
declare function tokenVerify(req: Request): Promise<DataStoredInToken | null>;
declare function token2user(req: Request): Promise<number>;
declare function aesDecryptModeECB(msg: string, pwd: string): string;
declare const _default: {
    setLogger: typeof setLogger;
    setSecureConfig: typeof setSecureConfig;
    user2token: typeof user2token;
    tokenVerify: typeof tokenVerify;
    token2user: typeof token2user;
    aesDecryptModeECB: typeof aesDecryptModeECB;
};
export default _default;
