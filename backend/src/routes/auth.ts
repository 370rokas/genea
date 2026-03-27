import Router from "@koa/router";
import { Context } from "koa";
import jwt from "jsonwebtoken";

import { logger } from "@/utils/logger";
import { TokenPayload } from "@/types/auth";
import { isAuthenticated } from "@/middlewares/auth";
import { UserModel } from "@/models/user.model";

const adminRouter = new Router({
  prefix: "/auth",
});

adminRouter.post("/login", async (ctx: Context) => {
  const { username, password } = ctx.request.body as any;

  const loggedInUser = await UserModel.checkPassword(username, password);

  if (!loggedInUser) {
    logger.warn(
      { username, ip: ctx.ip },
      "Login attempt with incorrect password",
    );

    ctx.status = 401;
    ctx.body = { error: "Invalid username or password" };
    return;
  }

  logger.info({ username, ip: ctx.ip }, "User logged in successfully");

  const tokenPayload: TokenPayload = loggedInUser;

  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET || "default_secret",
    { expiresIn: "1d" },
  );

  ctx.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  ctx.status = 200;
  ctx.body = tokenPayload;
});

adminRouter.post("/logout", async (ctx: Context) => {
  ctx.cookies.set("token", null);
  logger.info({ ip: ctx.ip }, "User logged out");

  ctx.status = 200;
  ctx.body = { message: "Logged out successfully" };
});

adminRouter.get("/me", isAuthenticated, async (ctx: Context) => {
  const user = ctx.state.user as TokenPayload;

  ctx.status = 200;
  ctx.body = user;
});

export default adminRouter;
