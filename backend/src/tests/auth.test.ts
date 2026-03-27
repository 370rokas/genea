import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Router from "@koa/router";

import { hasPermission, isAuthenticated } from "@/middlewares/auth";
import { pool } from "@/utils/db";
import app from "@/app";

// Test-only routes for auth middleware creation testing
const testRouter = new Router();
testRouter.get(
  "/test-has-permission",
  hasPermission(["MANAGE_USERS"]),
  (ctx) => {
    ctx.status = 200;
    ctx.body = { message: "Permission granted" };
  },
);
testRouter.get("/test-is-authenticated", isAuthenticated, (ctx) => {
  ctx.status = 200;
  ctx.body = { message: "Authenticated" };
});
app.use(testRouter.routes());

vi.mock("@/utils/db", () => ({
  pool: {
    query: vi.fn(),
    on: vi.fn(),
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn().mockResolvedValue(true),
    hash: vi.fn().mockResolvedValue("hashed_password"),
  },
}));

describe("Auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear history so tests don't interfere with each other
  });

  it("should deny access to admin routes without a cookie", async () => {
    const response = await request(app.callback()).get("/auth/me");
    expect(response.status).toBe(401);
  });

  it("should login and return a cookie", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          username: "admin",
          password_hash: "mocked_hash",
          permissions: ["SUDO"],
        },
      ],
      rowCount: 1,
    } as any);

    const response = await request(app.callback())
      .post("/auth/login")
      .send({ username: "admin", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body.username).toBe("admin");
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("should return 401 if the user is not found in DB", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
    } as any);

    const response = await request(app.callback())
      .post("/auth/login")
      .send({ username: "ghost", password: "password123" });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid username or password");
  });

  it("should return 401 if the password does not match", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [{ id: 1, username: "admin", password_hash: "hash" }],
      rowCount: 1,
    } as any);

    // Force bcrypt to fail for this specific test
    vi.mocked(bcrypt.compare).mockImplementationOnce(() =>
      Promise.resolve(false),
    );

    const response = await request(app.callback())
      .post("/auth/login")
      .send({ username: "admin", password: "wrong_password" });

    expect(response.status).toBe(401);
  });

  it("should return user data on /me when valid cookie is provided", async () => {
    const mockUser = { id: 1, username: "admin", permissions: ["SUDO"] };
    const secret = process.env.JWT_SECRET || "default_secret";
    const token = jwt.sign(mockUser, secret);

    const response = await request(app.callback())
      .get("/auth/me")
      .set("Cookie", [`token=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe("admin");
  });

  it("should clear the cookie on logout", async () => {
    const response = await request(app.callback()).post("/auth/logout");

    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"][0]).toContain("token=;");
  });

  it("should return 500 if the database query fails", async () => {
    vi.mocked(pool.query).mockRejectedValueOnce(
      new Error("Database connection lost"),
    );

    const response = await request(app.callback())
      .post("/auth/login")
      .send({ username: "admin", password: "password123" });

    expect(response.status).toBe(500);
  });

  it("should fail when the token is signed with a different secret", async () => {
    const badToken = jwt.sign({ id: 1 }, "wrong_secret_key");
    const response = await request(app.callback())
      .get("/auth/me")
      .set("Cookie", [`token=${badToken}`]);

    expect(response.status).toBe(401);
  });
});

describe("Auth Middleware", () => {
  it("should return 401 for a malformed token cookie", async () => {
    const response = await request(app.callback())
      .get("/auth/me")
      .set("Cookie", ["token=not-a-real-token"]);

    expect(response.status).toBe(401);
  });

  it("should return 401 for an expired token", async () => {
    const expiredToken = jwt.sign(
      { id: 1, exp: Math.floor(Date.now() / 1000) - 30 }, // Expired 30s ago
      process.env.JWT_SECRET || "default_secret",
    );

    const response = await request(app.callback())
      .get("/auth/me")
      .set("Cookie", [`token=${expiredToken}`]);

    expect(response.status).toBe(401);
  });

  it("should return 401 for an invalid JWT structure", async () => {
    const response = await request(app.callback())
      .get("/auth/me")
      .set("Cookie", ["token=completely-invalid-garbage-string"]);

    expect(response.status).toBe(401);
  });
});

describe("Auth Middleware - Permissions Logic", () => {
  const secret = process.env.JWT_SECRET || "default_secret";

  it("should return 403 if user lacks required permission", async () => {
    // User is authenticated but has "VIEWER" instead of "MANAGE_USERS"
    const token = jwt.sign(
      { id: 1, username: "test", permissions: ["VIEWER"] },
      secret,
    );

    const response = await request(app.callback())
      .get("/test-has-permission")
      .set("Cookie", [`token=${token}`]);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Forbidden: insufficient permissions");
  });

  it("should return 401 if permissions property is missing in JWT", async () => {
    const token = jwt.sign({ id: 1, username: "test" }, secret);

    const response = await request(app.callback())
      .get("/test-has-permission")
      .set("Cookie", [`token=${token}`]);

    expect(response.status).toBe(401);
  });

  it("should return 200 if user has the correct permission", async () => {
    const token = jwt.sign(
      { id: 1, username: "test", permissions: ["MANAGE_USERS"] },
      secret,
    );

    const response = await request(app.callback())
      .get("/test-has-permission")
      .set("Cookie", [`token=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Permission granted");
  });

  it("should return 401 when no token cookie is provided", async () => {
    const response = await request(app.callback()).get(
      "/test-is-authenticated",
    );

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Authentication required");
  });

  it("should return 401 when token is provided but is invalid/corrupt", async () => {
    const response = await request(app.callback())
      .get("/test-is-authenticated")
      .set("Cookie", ["token=thisisnotajwt"]);

    expect(response.status).toBe(401);
  });
});
