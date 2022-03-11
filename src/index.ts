import redisClient from './lib/redisClient'
import authority from './lib/authority'
import alisms from './lib/alisms'

const setLogger = (appointLogger: any) => {
  alisms.setLogger(appointLogger)
  authority.setLogger(appointLogger)
}
// export * from "./lib/redisClient";
export { SecureConfig } from './lib/authority'
export { AlismsConfig } from './lib/alisms'
export { setLogger, alisms, authority, redisClient }
