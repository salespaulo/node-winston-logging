const chai = require('chai')
const logger = require('../')

describe('/support', () => {
    it('Logging:', done => {
        logger.silly('Testing logging silly!')
        logger.debug('Testing logging debug!')
        logger.info('Testing logging info!')
        logger.warn('Testing logging warn!')
        logger.error('Testing logging error!', new Error(`testIt!`))

        chai.assert(!!logger.stream, 'Not found function .stream into logger obj!')
        chai.assert(!!logger.morgan, 'Not found function .morgan into logger obj!')

        chai.assert(true, 'Test OK!')
        done()
    })
})
