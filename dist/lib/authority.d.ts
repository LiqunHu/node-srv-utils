import { Request, Response, NextFunction } from 'express';
export { SecureConfig } from './security';
declare function setLogger(appointLogger: any): void;
declare function initMiddleware(dbhandle: any, config: any): void;
declare function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
declare const _default: {
    setLogger: typeof setLogger;
    initMiddleware: typeof initMiddleware;
    authMiddleware: typeof authMiddleware;
    aesDecryptModeCFB: (msg: string, pwd: string, magicNo: string) => string;
    user2token: (type: string, userId: string) => string;
};
export default _default;
