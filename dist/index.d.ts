import redisClient from './lib/redisClient';
import authority from './lib/authority';
import alisms from './lib/alisms';
declare const setLogger: (appointLogger: any) => void;
export { SecureConfig } from './lib/authority';
export { AlismsConfig } from './lib/alisms';
export { setLogger, alisms, authority, redisClient };
