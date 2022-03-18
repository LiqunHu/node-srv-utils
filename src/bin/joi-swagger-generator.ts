#! /usr/bin/env node
import yargs from 'yargs'
import j2s from 'joi-to-swagger'
import path from 'path'
import fs from 'fs-extra'
import glob from 'glob'

let argv = yargs.alias('v', 'validator')
.alias('o', 'output')
.alias('h', 'header')
.alias('b', 'baseUrl')
.alias('m', 'mapPath')
.describe('v', 'Location of validator file or directory of the folder')
.describe('o', 'Location of the output file location')
.describe('h', 'Location of the header file in json format')
.describe('r', 'For multiple files, will recursively search for .validator.js file in that directory')
.describe('b', 'Override base url')
.describe('m', 'Override redirect path')
.demandOption(['v', 'o', 'h'])
.help('help')
.example('joi-swagger-generator','joi-swagger-generator -r -v ./validators -h ./header.json -o ./swagger.json').argv as any

interface IPrototype { prototype: any; }
(String as IPrototype).prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}
const baseUrl = argv.baseUrl ? argv.baseUrl : 'http://${stageVariables.url}'
const relativeValidatorPath = argv.validator
const validatorFile = path.resolve(relativeValidatorPath)

function applyLogic(json, apiList) {
  const basePath = json.basePath
  json.info.title = json.info.title
  json.info.description = json.info.description

  // json.paths = {}
  // json.components = {
  //   securitySchemes: {
  //     ApiKeyAuth: {
  //       type: 'apiKey',
  //       in: 'header',
  //       name: 'Authorization'
  //     }
  //   },
  //   schemas: {}
  // }
  for (let key in apiList) {
    const mapHeader = {}
    const requestMap = {}
    const currentValue = apiList[key]

    let paths
    // let convertedPath = path.join(basePath, currentValue.path)
    let convertedPath = currentValue.path
    // const splitPath = convertedPath.split('/');
    // for(const i in splitPath){
    //     let eachPath = splitPath[i];
    //     if(eachPath.startsWith(":")){
    //         eachPath = eachPath.substr(1); //remove :
    //         eachPath = "{" + eachPath + "}";//make {path}
    //         splitPath[i] = eachPath;
    //     }
    // }
    convertedPath = convertPath(convertedPath)

    if (json.paths[convertedPath]) {
      paths = json.paths[convertedPath]
    } else {
      paths = {}
      json.paths[convertedPath] = paths
    }

    let parameters = []
    let requestBody = {
      required: false,
      content: {
        'application/json': {
          schema: {
            $ref: ''
          }
        }
      }
    }
    //default response
    let responses = {
      '200': {
        description: 'success operation'
      }
    }
    let deprecated = false
    if (currentValue.JoiSchema) {
      if (currentValue.JoiSchema.header) {
        const { swagger } = j2s(currentValue.JoiSchema.header)

        for (let headerKey in swagger.properties) {
          parameters.push({
            name: headerKey,
            in: 'header',
            required: swagger.required.includes(headerKey),
            type: swagger.properties[headerKey].type
          })
          requestMap[`integration.request.header.${headerKey}`] = `method.request.header.${headerKey}`
        }
      }
      if (currentValue.JoiSchema.body) {
        requestBody.required = true
        const { swagger } = j2s(currentValue.JoiSchema.body)

        const modelName = `${currentValue.enname.replace(/\s/g, '')}${currentValue.type.capitalize()}Body`
        json.components.schemas[modelName] = swagger
        // requestBody.content.push({
        //   'application/json': {
        //     schema: {
        //       $ref: `#/components/schemas/${modelName}`
        //     }
        //   }
        // })
        requestBody.content['application/json'].schema['$ref'] = `#/components/schemas/${modelName}`
        // parameters.push({
        //     name: "body",
        //     in: "body",
        //     schema: {
        //         $ref: `#/definitions/${modelName}`
        //     }
        //     // schema: swagger
        // });
      }
      if (currentValue.JoiSchema.path) {
        const { swagger } = j2s(currentValue.JoiSchema.path)

        for (let pathKey in swagger.properties) {
          parameters.push({
            name: pathKey,
            in: 'path',
            required: true,
            type: swagger.properties[pathKey].type
          })
        }
      }
      if (currentValue.JoiSchema.query) {
        const { swagger } = j2s(currentValue.JoiSchema.query)

        for (let queryKey in swagger.properties) {
          parameters.push({
            name: queryKey,
            in: 'query',
            required: swagger.required ? swagger.required.includes(queryKey) : false,
            type: swagger.properties[queryKey].type
          })
        }
      }
      if (currentValue.JoiSchema.response) {
        let responses = {}
        const { swagger } = j2s(currentValue.JoiSchema.response)

        for (let statusCode in swagger.properties) {
          const modelName = `${currentValue.enname.replace(/\s/g, '')}${currentValue.type.capitalize()}${statusCode}Response`
          json.components.schemas[modelName] = swagger.properties[statusCode].properties.body

          const data = {
            description: swagger.properties[statusCode].properties.description.enum[0],
            schema: {
              $ref: `#/components/schemas/${modelName}`
            }
          }

          if (swagger.properties[statusCode].properties.header) {
            data['headers'] = swagger.properties[statusCode].properties.header.properties

            for (let headerName in swagger.properties[statusCode].properties.header.properties) {
              mapHeader[`integration.response.header.${headerName}`] = `method.response.header.${headerName}`
            }
          }

          responses[statusCode] = data
        }
      }
      // check for deprecation
      if (currentValue.JoiSchema.deprecated && currentValue.JoiSchema.deprecated === true) {
        deprecated = true
      }
    }

    // let apiGateway
    // if (argv.mapPath) {
    //   let editedPath = path.join(argv.mapPath, currentValue.path)
    //   editedPath = convertPath(editedPath)

    //   apiGateway = getApiGatewayIntegration(currentValue, editedPath, mapHeader, requestMap)
    // } else {
    //   apiGateway = getApiGatewayIntegration(currentValue, convertedPath, mapHeader, requestMap)
    // }

    paths[currentValue.type] = {
      summary: currentValue.name,
      tags: currentValue.tags,
      parameters,
      requestBody,
      responses,
      deprecated
    }
  }
  return json
}

if (argv.r) {
  glob(path.join(validatorFile, '**/*.validator.ts'), function(er, files) {
    console.log(files)
    let requires = []
    files.forEach((value, index, array) => {
      requires.push(require(value))
    })

    const relativeHeaderPath = argv.header
    const headerFile = path.resolve(relativeHeaderPath)
    if (!fs.pathExistsSync(headerFile)) {
      return console.error(`Header file not found in ${headerFile}, please create header file first`)
    } else {
      try {
        fs.ensureFileSync(headerFile)
      } catch (e) {
        return console.error(`Header file not found in ${headerFile}, please create header file first`)
      }
    }

    let json = require(headerFile)

    const relativeOutputFile = argv.output
    if (!relativeOutputFile) {
      return console.error('Output file location is required')
    }
    const outputFile = path.resolve(relativeOutputFile)
    for (let r of requires) {
      json = applyLogic(json, r.apiList)
    }

    fs.outputFile(outputFile, JSON.stringify(json, null, 4), function(err) {
      if (err) {
        console.error(err)
        process.exit(1)
      } else {
        console.log('successfully write swagger file to ' + outputFile)
        process.exit(0)
      }
    })
  })
} else {
  if (!fs.pathExistsSync(validatorFile)) {
    console.error(`Validator file not found in ${validatorFile}, please create validator file first`)
    process.exit(1)
  } else {
    try {
      fs.ensureFileSync(validatorFile)
    } catch (e) {
      console.error(`Validator file not found in ${validatorFile}, please create validator file first`)
      process.exit(1)
    }
  }
  const validator = require(validatorFile)

  const relativeHeaderPath = argv.header
  const headerFile = path.resolve(relativeHeaderPath)
  if (!fs.pathExistsSync(headerFile)) {
    console.error(`Header file not found in ${headerFile}, please create header file first`)
    process.exit(1)
  } else {
    try {
      fs.ensureFileSync(headerFile)
    } catch (e) {
      console.error(`Header file not found in ${headerFile}, please create header file first`)
      process.exit(1)
    }
  }

  let json = require(headerFile)

  const relativeOutputFile = argv.output
  if (!relativeOutputFile) {
    console.error('Output file location is required')
    process.exit(1)
  }
  const outputFile = path.resolve(relativeOutputFile)

  json = applyLogic(json, validator.apiList)
  fs.outputFile(outputFile, JSON.stringify(json, null, 4), function(err) {
    if (err) {
      console.error(err)
      process.exit(1)
    } else {
      console.log('successfully write swagger file to ' + outputFile)
      process.exit(0)
    }
  })
}

function convertPath(editedPath) {
  const splitPath = editedPath.split('/')
  for (const i in splitPath) {
    let eachPath = splitPath[i]
    if (eachPath.startsWith(':')) {
      eachPath = eachPath.substr(1) //remove :
      eachPath = '{' + eachPath + '}' //make {path}
      splitPath[i] = eachPath
    }
  }
  editedPath = splitPath.join('/')
  return editedPath
}

function getApiGatewayIntegration(currentValue, convertedPath, mapHeader, requestMap) {
  const apiGateway = {
    passthroughBehavior: 'when_no_match',
    httpMethod: currentValue.type,
    type: 'http_proxy',
    uri: baseUrl + convertedPath,
    responses: {
      default: {
        statusCode: '200'
      }
    }
  }
  let requestPath = { ...requestMap }
  const splitPath = convertedPath.split('/')
  for (const i in splitPath) {
    let eachPath = splitPath[i]
    if (eachPath.startsWith('{') && eachPath.endsWith('}')) {
      const pathName = eachPath.slice(1, -1)
      const keyName = 'integration.request.path.' + pathName
      const valueName = 'method.request.path.' + pathName
      requestPath[keyName] = valueName
    }
  }

  apiGateway['requestParameters'] = requestPath
  apiGateway['responseParameters'] = mapHeader
  return apiGateway
}
