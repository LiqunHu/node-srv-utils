import _ from 'lodash'
import { Request, Response, NextFunction } from 'express'
import redisClient from './redisClient'
import security from './security'
export { SecureConfig } from './security'

let logger = console
let dbhandle: any

function setLogger(createLogger: any) {
  logger = createLogger(__filename)
}

function initMiddleware(dbhandle: any, config: any) {
  dbhandle = dbhandle
  security.setSecureConfig(config)
}

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    let apis = await redisClient.get('AUTHAPI')
    if (_.isEmpty(apis)) {
      let apiList = await dbhandle(
        'select api_function, auth_flag from tbl_common_api where state = "1" and api_function != ""',
        []
      )

      for (let a of apiList) {
        apis[a.api_function] = a.auth_flag
      }
    }

    let patha = req.path.split('/')
    let func = patha[patha.length - 2].toUpperCase()

    let checkresult = await security.token2user(req)

    if (func in apis) {
      if (apis[func] === '1') {
        if (checkresult != 0) {
          if (checkresult === -2) {
            logger.info('UNAUTHORIZED')
            return res.status(401).send({
              errno: -2,
              msg: 'Login from other place',
            })
          } else {
            logger.info('UNAUTHORIZED')
            return res.status(401).send({
              errno: -1,
              msg: 'Auth Failed or session expired',
            })
          }
        }
      }
    } else {
      if (func != 'AUTH') {
        logger.info('UNAUTHORIZED')
        return res.status(401).send({
          errno: -1,
          msg: 'Auth Failed or session expired',
        })
      }
    }
  } catch (error: any) {
    let sendData = {}
    if (process.env.NODE_ENV === 'dev') {
      sendData = {
        errno: -1,
        msg: error.stack,
      }
    } else {
      sendData = {
        errno: -1,
        msg: 'Internal Error',
      }
    }
    return res.status(500).send(sendData)
  }
  next()
}

export default {
  setLogger,
  initMiddleware,
  authMiddleware,
  aesDecryptModeCFB: security.aesDecryptModeCFB,
  user2token: security.user2token,
  tokenVerify: security.tokenVerify,
}
