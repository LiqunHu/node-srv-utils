"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const node_schedule_1 = __importDefault(require("node-schedule"));
let logger = console;
let scheduleJobs = Object.create(null);
function setLogger(appointLogger) {
    logger = appointLogger.createLogger(__filename);
}
function initSchedule(cfg, router) {
    if (scheduleJobs) {
        if (!lodash_1.default.isEmpty(scheduleJobs)) {
            for (let job of Object.values(scheduleJobs)) {
                job.cancel();
            }
        }
    }
    scheduleJobs = {};
    for (let job of cfg) {
        let func = router[job.name];
        if (func) {
            try {
                scheduleJobs[job.name] = node_schedule_1.default.scheduleJob(job.rule, () => {
                    func()
                        .then(() => {
                        logger.info(job.name + ' Success');
                    })
                        .catch((error) => {
                        logger.error(error);
                    });
                });
            }
            catch (error) {
                logger.error(error.stack);
            }
        }
        else {
            logger.error(job.name, ' do not exist');
        }
    }
}
exports.default = {
    setLogger,
    initSchedule,
};
