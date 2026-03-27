import Koa, { Context } from "koa";
import Router from "@koa/router";
import cors from "@koa/cors";
import compress from "koa-compress";
import helmet from "koa-helmet";
import bodyParser from "koa-bodyparser";
import requestId from "koa-requestid";

import { loggerMiddleware } from "@/middlewares/log";
import { errorHandler } from "@/middlewares/errors";
import { ALLOWED_ORIGINS, IS_PROD } from "@/utils/constants";
import adminRouter from "@/routes/auth";
import locationRouter from "@/routes/location";

const app = new Koa();
const router = new Router();

// Middlewares
app.use(helmet());
app.use(compress());
app.use(bodyParser());
app.use(requestId());
app.use(errorHandler);
app.use(loggerMiddleware);

// CORS configuration with dynamic origin handling
const originSet = new Set(ALLOWED_ORIGINS);
app.use(
  cors({
    origin: (ctx: Context) => {
      const origin = ctx.get("Origin");

      // dev tools (Postman/Insomnia)
      if (!IS_PROD && !origin) return "*";

      if (originSet.has(origin)) return origin;

      return ALLOWED_ORIGINS[0]; // Default to first allowed origin if not matched
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
  }),
);

// Cloudflare support
app.proxy = true;

router.get("/health", (ctx) => {
  ctx.status = 200;
  ctx.body = { status: "ok" };
});

app.use(router.routes());
app.use(router.allowedMethods());

// Add routes
app.use(adminRouter.routes());
app.use(locationRouter.routes());

// Export the app instance
export default app;
