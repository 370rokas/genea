import type { Context, Next } from 'koa';
import { logger } from '@/utils/logger';

export const errorHandler = async (ctx: Context, next: Next) => {
    try {
        await next();
    } catch (err: any) {
        ctx.status = err.status || 500;

        logger.error({
            err,
            url: ctx.url,
            method: ctx.method,
            params: ctx.params,
            requestId: ctx.state.id,
        }, 'request error');

        ctx.body = { error: 'Internal Server Error' };
    }
}