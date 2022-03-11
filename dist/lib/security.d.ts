import { Request } from 'express';
export interface SecureConfig {
    SECRET_KEY: string;
    TOKEN_AGE: number;
    MOBILE_TOKEN_AGE: number;
    SYSTEM_TOKEN_AGE: number;
}
declare function setLogger(appointLogger: any): void;
declare function setSecureConfig(cfg: SecureConfig): void;
declare function user2token(type: string, userId: string): string | null;
declare function token2user(req: Request): Promise<number>;
declare function aesDecryptModeCFB(msg: string, pwd: string, magicNo: string): string;
declare const _default: {
    setLogger: typeof setLogger;
    setSecureConfig: typeof setSecureConfig;
    user2token: typeof user2token;
    token2user: typeof token2user;
    aesDecryptModeCFB: typeof aesDecryptModeCFB;
};
export default _default;
