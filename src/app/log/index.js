'use strict'

/**
 * Logging Winston Lib
 * @author Paulo R. A. Sales
 */
const winston = require('winston')
const morgan = require('morgan')
const config = require('config')
const uuid = require('uuid')

const utils = require('node-config-utils')
const { IS_ENV_PROD } = utils

const FILE_LEVEL = config.has('logger.file.level') ? config.get('logger.file.level') : 'info'
const FILE_NAME = config.has('logger.file.path') ? config.get('logger.file.path') : '/tmp/node-express-server-api.log'
const CONSOLE_LEVEL = config.has('logger.console.level') ? config.get('logger.console.level') : 'info'

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || null
const ELASTICSEARCH_INDEXPREFIX = config.has('logger.elasticsearch.indexPrefix')
    ? config.get('logger.elasticsearch.indexPrefix')
    : `log-${uuid.v4()}`

const elasticsearch = () => {
    const Elasticsearch = require('winston-elasticsearch')

    return new Elasticsearch({
        level: FILE_LEVEL,
        indexPrefix: ELASTICSEARCH_INDEXPREFIX,
        handleExceptions: true,
        format: winston.format.json(),
        colorize: false,
        clientOpts: {
            host: ELASTICSEARCH_URL,
            log: [
                {
                    levels: ['error']
                }
            ]
        }
    })
}

const transports = [
    new winston.transports.File({
        level: FILE_LEVEL,
        filename: FILE_NAME,
        handleExceptions: true,
        format: winston.format.json(),
        maxsize: 5242880, //5MB
        maxFiles: 5,
        colorize: false
    }),
    new winston.transports.Console({
        level: CONSOLE_LEVEL,
        handleExceptions: true,
        format:
            process.env.NODE_ENV === 'production'
                ? winston.format.combine(winston.format.simple())
                : winston.format.combine(winston.format.colorize(), winston.format.simple())
    })
]

if (IS_ENV_PROD() && ELASTICSEARCH_URL) {
    transports.push(elasticsearch())
}

const logger = new winston.createLogger({
    transports,
    exitOnError: false
})

logger.stream = {
    write: message => logger.info(message)
}

const createMorgan = () => morgan('combined', { stream: logger.stream })
logger.morgan = createMorgan

module.exports = logger
