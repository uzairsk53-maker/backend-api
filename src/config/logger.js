const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

const transports = [
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
                info => `${info.timestamp} ${info.level}: ${info.message}`
            )
        )
    }),
    new DailyRotateFile({
        filename: path.join(logDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxFiles: '14d',
    }),
    new DailyRotateFile({
        filename: path.join(logDir, 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
    })
];

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports
});

module.exports = logger;
