import Redis, {
  RedisOptions,
  ClusterOptions,
  ClusterNode,
  KeyType,
  ValueType,
} from 'ioredis'

let client: Redis.Redis
let cluster: Redis.Cluster

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
  key: KeyType,
  value: any,
  expiryMode?: string | any[],
  time?: number | string,
  setMode?: number | string
) {
  if (!!setMode) {
    await client.set(key, JSON.stringify(value), expiryMode, time, setMode)
  } else if (!!expiryMode) {
    await client.set(key, JSON.stringify(value), expiryMode, time)
  } else {
    await client.set(key, JSON.stringify(value))
  }
}

async function get(key: KeyType) {
  let result = await client.get(key)
  if (result) {
    return JSON.parse(result)
  } else {
    return null
  }
}

async function del(key: KeyType) {
  await client.del(key)
}

async function hmset(
  key: KeyType,
  data:
    | Map<string, ValueType>
    | ValueType[]
    | {
        [key: string]: ValueType
      }
) {
  await client.hmset(key, data)
}

async function hset(
  key: KeyType,
  data: any[] | { [key: string]: any } | Map<string, ValueType>
) {
  await client.hset(key, data)
}

async function hgetall(key: KeyType) {
  let result = await client.hgetall(key)
  return result
}

async function hget(key: KeyType, field: string) {
  let result = await client.hget(key, field)
  return result
}

async function hdel(key: KeyType, args: KeyType[]) {
  await client.hdel(key, args)
}

async function ttl(key: KeyType): Promise<number> {
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
  ttl
}
