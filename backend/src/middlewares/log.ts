import { Context, Next } from 'koa';
import { logger } from '@/utils/logger';

export const loggerMiddleware = async (ctx: Context, next: Next) => {
  const start = Date.now();
  
  try {
    await next();
  } finally {
    const duration = Date.now() - start;
    logger.info({
      method: ctx.method,
      url: ctx.url,
      status: ctx.status,
      duration: `${duration}ms`,
      ip: ctx.ip,
      requestId: ctx.state.id,
    }, 'request completed');
  }
}