/// <reference types="qs" />
import { Request, Response, NextFunction } from 'express';
export { SecureConfig } from './security';
declare function setLogger(createLogger: any): void;
declare function initMiddleware(dbhandle: any, config: any): void;
declare function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
declare const _default: {
    setLogger: typeof setLogger;
    initMiddleware: typeof initMiddleware;
    authMiddleware: typeof authMiddleware;
    aesDecryptModeCBC: (msg: string, pwd: string) => Promise<string>;
    user2token: (type: string, userId: string) => string;
    tokenVerify: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>) => Promise<string | import("./security").DataStoredInToken>;
};
export default _default;
