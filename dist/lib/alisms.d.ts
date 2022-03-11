declare function setLogger(appointLogger: any): void;
export interface AlismsConfig {
    accessKeyId: string;
    accessKeySecret: string;
}
declare function initAlicloud(config: AlismsConfig): void;
declare function sendSms(params: Object): Promise<void>;
declare const _default: {
    setLogger: typeof setLogger;
    initAlicloud: typeof initAlicloud;
    sendSms: typeof sendSms;
};
export default _default;
