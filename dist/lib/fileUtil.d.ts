import { Request } from 'express';
declare function setLogger(createLogger: any): void;
declare function fileSaveLocal(req: Request, svpath: string, urlbase: string): Promise<unknown>;
declare const _default: {
    setLogger: typeof setLogger;
    fileSaveLocal: typeof fileSaveLocal;
};
export default _default;
