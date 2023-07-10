import fs from 'fs'
import path from 'path'
import multiparty from 'multiparty'
import { Request } from 'express'
import mime from 'mime-types'

let logger = console

function setLogger(createLogger: any) {
  logger = createLogger(__filename)
}

async function fileSaveLocal(req: Request, svpath: string, urlbase: string) {
  return new Promise((resolve, reject) => {
    if (req.is('multipart/*')) {
      try {
        if (!fs.existsSync(svpath)) {
          let result = fs.mkdirSync(svpath, { recursive: true })
          if (result) {
            reject(result)
          }
        }
        let uploadOptions = {
          autoFields: true,
          autoFiles: true,
          uploadDir: svpath,
          maxFileSize: 30 * 1024 * 1024,
        }
        let form = new multiparty.Form(uploadOptions)
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(err)
          }
          if (files.file) {
            logger.debug(files.file[0].path)
            resolve({
              name: files.file[0].originalFilename,
              ext: path.extname(files.file[0].path),
              url: urlbase + path.basename(files.file[0].path),
              type: mime.lookup(path.extname(files.file[0].path)),
              path: files.file[0].path,
            })
          } else {
            reject('no file')
          }
        })
      } catch (error) {
        reject(error)
      }
    } else {
      reject('content-type error')
    }
  })
}

export default {
  setLogger,
  fileSaveLocal,
}
