declare function setLogger(createLogger: any): void;
export interface scheduleConfig {
    name: string;
    rule: string;
}
interface routerConfig {
    [index: string]: any;
}
declare function initSchedule(cfg: scheduleConfig[], router: routerConfig): void;
declare const _default: {
    setLogger: typeof setLogger;
    initSchedule: typeof initSchedule;
};
export default _default;
