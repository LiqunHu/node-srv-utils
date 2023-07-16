import { webcrypto } from 'crypto'
import { Request } from 'express'
import { sign, verify } from 'jsonwebtoken'
import redisClient from './redisClient'

export interface SecureConfig {
  SECRET_KEY: string
  TOKEN_AGE: number
  MOBILE_TOKEN_AGE: number
  SYSTEM_TOKEN_AGE: number
}

export interface DataStoredInToken {
  type: string
  user_id: string
  exp: number
  token?: string
}

let logger = console
let config: SecureConfig

function setLogger(createLogger: any) {
  logger = createLogger(__filename)
}

function setSecureConfig(cfg: SecureConfig) {
  config = cfg
}

function user2token(type: string, userId: string): string | null {
  try {
    let expires: number
    if (type === 'MOBILE' || type === 'OA' || type === 'MP') {
      expires = config.MOBILE_TOKEN_AGE
    } else if (type === 'SYSTEM') {
      expires = config.SYSTEM_TOKEN_AGE
    } else {
      expires = config.TOKEN_AGE
    }

    let token = sign({ type: type, user_id: userId }, config.SECRET_KEY, {
      expiresIn: expires,
    })
    return token
  } catch (error) {
    logger.error(error)
    return null
  }
}

async function tokenVerify(req: Request): Promise<DataStoredInToken | null> {
  let token_str = req.cookies['Authorization'] || req.header('Authorization')
  if (!token_str) {
    logger.debug('no token')
    return null
  }

  try {
    let tokenData = (await verify(
      token_str,
      config.SECRET_KEY
    )) as DataStoredInToken

    tokenData.token = token_str
    return tokenData
  } catch (error) {
    return null
  }
}

async function token2user(req: Request): Promise<number> {
  try {
    let tokenData = await tokenVerify(req)
    if (!tokenData) {
      return -1
    }
    let token = tokenData.token,
      expires = tokenData.exp,
      type = tokenData.type,
      user_id = tokenData.user_id

    if (expires < Date.now() / 1000) {
      logger.debug('expires')
      return -3
    }

    let authData = await redisClient.get(['AUTH', type, user_id].join('_'))
    if (authData) {
      let user = authData.user
      if (!user) {
        logger.debug('user do not exist')
        return -1
      }
      req.user = user

      if (authData.session_token != token) {
        logger.debug('login from other place')
        return -2
      }

      let patha = req.path.split('/')
      let func = patha[patha.length - 2].toUpperCase()

      // if (
      //   config.syslogFlag &&
      //   func !== 'AUTH' &&
      //   method !== 'init' &&
      //   method !== 'search' &&
      //   method.search(/search/i) < 0
      // ) {
      //   tb_common_userlog.create({
      //     user_id: user.user_id,
      //     api_function: func,
      //     userlog_method: method,
      //     userlog_para: JSON.stringify(req.body)
      //   })
      // }

      let apiList = authData.authApis

      //auth control
      let apis: { [key: string]: any } = {}
      for (let m of apiList) {
        apis[m.api_function] = ''
      }

      if (func in apis) {
        return 0
      }
    } else {
      logger.error('Redis get authData failed')
      return -3
    }

    return -1
  } catch (error) {
    logger.error(error)
    return -1
  }
}

async function aesDecryptModeCBC(msg: string, pwd: string): Promise<string> {
  try {
    let encrypted = Buffer.from(msg, 'base64')

    let key = Buffer.from(pwd, 'hex')

    let iv = new Uint8Array(16)
    iv[0] = 1

    const key_encoded = await webcrypto.subtle.importKey(
      'raw',
      key,
      'AES-CBC',
      false,
      ['encrypt', 'decrypt']
    )

    const decrypted = await webcrypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv: iv,
      },
      key_encoded,
      encrypted
    )
    const dec = new TextDecoder('utf-8')
    return dec.decode(decrypted)
  } catch (error) {
    return ''
  }
}

export default {
  setLogger,
  setSecureConfig,
  user2token,
  tokenVerify,
  token2user,
  aesDecryptModeCBC,
}
