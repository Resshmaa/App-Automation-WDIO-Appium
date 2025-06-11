var colors = require('colors');
const DateUtil = require('./DateUtil');

const LogLevel = {
    AUDIT: 0,
    ERROR: 1,
    WARNING: 2,
    INFO: 3,
    DEBUG: 4
};

class Log {

    /**
    Set log level
    @param {string} level to be set for logging
    */
    static setLogLevel(level) {
        switch (level) {
            case 'ERROR':
                this.logLevel = LogLevel.ERROR;
                break;
            case 'WARNING':
                this.logLevel = LogLevel.WARNING;
                break;
            case 'AUDIT':
                this.logLevel = LogLevel.AUDIT;
                break;
            case 'INFO':
                this.logLevel = LogLevel.INFO;
                break;
            case 'DEBUG':
                this.logLevel = LogLevel.DEBUG;
                break;
            default:
                this.logLevel = LogLevel.DEBUG;
        }
    }

    // static logLevel = LogLevel.DEBUG;

    // //Just examples of possibilites
    // static note(message) {
    //     console.log(`NOTE: `.blue + `${message}`)
    // }

    // static pass(message) {
    //     console.log(`PASS: `.green + `${message}`)
    // }

    static info(message) {
        if (this.logLevel >= LogLevel.INFO)
            console.log(`[${DateUtil.getDateISOString()}]` + ' INFO: ' + `${message}`)
    }

    static warning(message) {
        if (this.logLevel >= LogLevel.WARNING)
            console.log(`[${DateUtil.getDateISOString()}]` + ' WARNING: '.yellow + `${message}`);
    }

    static error(message) {
        if (this.logLevel >= LogLevel.ERROR)
            console.log(`[${DateUtil.getDateISOString()}]` + ' ERROR: '.red + `${message}`);
    }

    static debug(message) {
        if (this.logLevel >= LogLevel.DEBUG)
            console.log(`[${DateUtil.getDateISOString()}]` + ' DEBUG: '.blue + `${message}`);
    }

    static audit(message) {
        if (this.logLevel >= LogLevel.AUDIT)
            console.log(`[${DateUtil.getDateISOString()}]` + ' AUDIT: ' + `${message}`);
    }
}

module.exports = Log;