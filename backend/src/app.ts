import Koa from 'koa';
import Router from '@koa/router';
import cors from '@koa/cors';
import compress from 'koa-compress';
import helmet from 'koa-helmet';
import bodyParser from 'koa-bodyparser';
import requestId from 'koa-requestid';

import { loggerMiddleware } from '@/middlewares/log';
import { errorHandler } from '@/middlewares/errors';

const app = new Koa();
const router = new Router();

// Middlewares
app.use(helmet());
app.use(compress());
app.use(cors());
app.use(bodyParser());
app.use(requestId());
app.use(errorHandler);
app.use(loggerMiddleware);

// Cloudflare support
app.proxy = true;

router.get('/', async (ctx) => {
  ctx.body = 'Home page';
});

router.get('/err', async (ctx) => {
  throw new Error("Test error handling");
});

app.use(router.routes());
app.use(router.allowedMethods());

// Export the app instance
export default app;