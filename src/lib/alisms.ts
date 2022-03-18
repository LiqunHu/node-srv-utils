import Core from '@alicloud/pop-core'
let logger = console
let client: Core

function setLogger(createLogger: any) {
  logger = createLogger(__filename)
}

export interface AlismsConfig {
  accessKeyId: string
  accessKeySecret: string
}

function initAlicloud(config: AlismsConfig) {
  client = new Core({
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25',
  })
}

async function sendSms(params: Object) {
  let result = await client.request('SendSms', params, { method: 'POST' })
  logger.debug(result)
}

export default {
  setLogger,
  initAlicloud,
  sendSms
}
