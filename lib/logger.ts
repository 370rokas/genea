import fs from "fs";
import winston from "winston";
import "winston-daily-rotate-file";

// Create logs folder just incase
if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
}

function safeStringify(obj: any) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) return "[Circular]";
            seen.add(value);
        }
        return value;
    }, 4); // 4-space indentation for pretty print
}

const consoleFormat = winston.format.printf(({ level, message, timestamp, durationMs }) => {
    let msg = message;
    try {
        if (typeof message === 'object' && message !== null) {
            msg = safeStringify(message);
        }
        if (typeof msg === 'string') {
            msg = msg.replace(/^"(.*)"$/, '$1');
        }
    } finally {
        return `${timestamp} [${level}]: ${msg} ${durationMs ? `(${durationMs}ms)` : ''}`;
    };
});

const transports: winston.transport[] = [];

transports.push(new winston.transports.DailyRotateFile({
    filename: './logs/%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
}));

transports.push(new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'debug',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        consoleFormat
    ),
}));

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    format: winston.format.combine(
        winston.format.json({ space: 2 }),
        winston.format.errors({ stack: true }),
    ),
    transports: transports,
});

export default logger;