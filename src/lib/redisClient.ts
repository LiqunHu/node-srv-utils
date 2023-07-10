import Redis, {
  RedisOptions,
  ClusterOptions,
  ClusterNode,
  Cluster,
  RedisKey,
  RedisValue,
} from 'ioredis'

let client: Redis
let cluster: Cluster

function initClient(config: RedisOptions) {
  client = new Redis(config)
}

function initCluster(
  nodes: ClusterNode[],
  options?: ClusterOptions | undefined
) {
  cluster = new Redis.Cluster(nodes, options)
}

/* expiryMode
EX seconds -- Set the specified expire time, in seconds.
PX milliseconds -- Set the specified expire time, in milliseconds.
NX -- Only set the key if it does not already exist.
XX -- Only set the key if it already exist.
KEEPTTL -- Retain the time to live associated with the key
*/
async function set(
  key: RedisKey,
  value: any,
  expiryMode?: 'NX' | 'XX' | 'PX' | 'EX',
  time?: number | string
) {
  if (!!expiryMode) {
    if (expiryMode == 'NX') {
      await client.set(key, JSON.stringify(value), 'NX')
    } else if (expiryMode == 'XX') {
      await client.set(key, JSON.stringify(value), 'XX')
    } else if (expiryMode == 'EX') {
      await client.set(key, JSON.stringify(value), 'EX', time)
    } else if (expiryMode == 'PX') {
      await client.set(key, JSON.stringify(value), 'PX', time)
    }
  } else {
    await client.set(key, JSON.stringify(value))
  }
}

async function get(key: RedisKey) {
  let result = await client.get(key)
  if (result) {
    return JSON.parse(result)
  } else {
    return null
  }
}

async function del(key: RedisKey) {
  await client.del(key)
}

async function hmset(
  key: RedisKey,
  data:
    | Map<string, RedisValue>
    | RedisValue[]
    | {
        [key: string]: RedisValue
      }
) {
  await client.hmset(key, data)
}

async function hset(
  key: RedisKey,
  data: any[] | { [key: string]: any } | Map<string, RedisValue>
) {
  await client.hset(key, data)
}

async function hgetall(key: RedisKey) {
  let result = await client.hgetall(key)
  return result
}

async function hget(key: RedisKey, field: string) {
  let result = await client.hget(key, field)
  return result
}

async function hdel(key: RedisKey, ...args: (string | Buffer)[]) {
  await client.hdel(key, ...args)
}

async function ttl(key: RedisKey): Promise<number> {
  let result = await client.ttl(key)
  return result
}

export default {
  initClient,
  set,
  get,
  del,
  hmset,
  hset,
  hgetall,
  hget,
  hdel,
  ttl,
}
