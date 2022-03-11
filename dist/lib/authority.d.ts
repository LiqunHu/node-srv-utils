/// <reference types="qs" />
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
    tokenVerify: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>) => Promise<import("./security").DataStoredInToken>;
};
export default _default;
