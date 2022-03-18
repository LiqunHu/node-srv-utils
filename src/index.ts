import redisClient from './lib/redisClient'
import authority from './lib/authority'
import alisms from './lib/alisms'
import scheduleJob from './lib/scheduleJob'

const setLogger = (appointLogger: any) => {
  alisms.setLogger(appointLogger)
  authority.setLogger(appointLogger)
  scheduleJob.setLogger(appointLogger)
}
// export * from "./lib/redisClient";
export { SecureConfig } from './lib/authority'
export { AlismsConfig } from './lib/alisms'
export { scheduleConfig } from './lib/scheduleJob'
export { setLogger, alisms, authority, redisClient, scheduleJob }
