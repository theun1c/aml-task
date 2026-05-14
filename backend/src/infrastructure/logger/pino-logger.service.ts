import { Injectable } from '@nestjs/common';
import pino from 'pino';

@Injectable()
export class PinoLoggerService {
  private logger: pino.Logger;

  constructor() {
    const pinoInstance = pino(
      {
        level: process.env.LOG_LEVEL || 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
      },
      process.env.NODE_ENV === 'production'
        ? pino.destination('/var/log/aml-backend.log')
        : pino.destination(),
    );
    this.logger = pinoInstance;
  }

  info(msg: string, meta?: any) {
    this.logger.info(meta, msg);
  }

  error(msg: string, error?: Error | any) {
    this.logger.error(error || {}, msg);
  }

  warn(msg: string, meta?: any) {
    this.logger.warn(meta, msg);
  }

  debug(msg: string, meta?: any) {
    this.logger.debug(meta, msg);
  }

  getLogger() {
    return this.logger;
  }
}
