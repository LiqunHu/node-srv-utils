import CryptoJS from 'crypto-js'
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
  let token_str =
    req.cookies['Authorization'] ||
    (req.header('Authorization')
      ? req.header('Authorization').split('Bearer ')[1]
      : null)
  if (!token_str) {
    logger.debug('no token')
    return null
  }

  let tokenData = (await verify(
    token_str,
    config.SECRET_KEY
  )) as DataStoredInToken

  tokenData.token = token_str
  return tokenData
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

    if (expires < Date.now()/1000) {
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
      return -1
    }

    return -1
  } catch (error) {
    logger.error(error)
    return -1
  }
}

function aesDecryptModeECB(msg: string, pwd: string): string {
  let key = CryptoJS.enc.Hex.parse(pwd)

  let decrypted = CryptoJS.AES.decrypt(msg, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.ZeroPadding,
  }).toString(CryptoJS.enc.Utf8)
  return decrypted
}

export default {
  setLogger,
  setSecureConfig,
  user2token,
  tokenVerify,
  token2user,
  aesDecryptModeECB,
}
