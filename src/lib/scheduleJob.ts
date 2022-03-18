import _ from 'lodash'
import schedule from 'node-schedule'
let logger = console
let scheduleJobs: { [index: string]: any } = Object.create(null)

function setLogger(createLogger: any) {
  logger = createLogger(__filename)
}

export interface scheduleConfig {
  name: string
  rule: string
}
interface routerConfig {
  [index: string]: any
}
function initSchedule(cfg: scheduleConfig[], router: routerConfig) {
  if (scheduleJobs) {
    if (!_.isEmpty(scheduleJobs)) {
      for (let job of Object.values(scheduleJobs)) {
        job.cancel()
      }
    }
  }
  scheduleJobs = {}
  for (let job of cfg) {
    let func = router[job.name]
    if (func) {
      try {
        scheduleJobs[job.name] = schedule.scheduleJob(job.rule, () => {
          func()
            .then(() => {
              logger.info(job.name + ' Success')
            })
            .catch((error) => {
              logger.error(error)
            })
        })
      } catch (error) {
        logger.error(error.stack)
      }
    } else {
      logger.error(job.name, ' do not exist')
    }
  }
}

export default {
  setLogger,
  initSchedule,
}
