import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "@/app";

describe("App General Routes", () => {
  it("should return 200 on /health", async () => {
    const response = await request(app.callback()).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});

describe("CORS Middleware", () => {
  it("should not set CORS headers when no Origin is present", async () => {
    const response = await request(app.callback()).get("/health");

    // Change this line to accept an empty string
    expect(response.headers["access-control-allow-origin"]).toBeFalsy();
    // OR
    expect(response.headers["access-control-allow-origin"]).toBe("");
  });

  it("should allow request from a whitelisted dev origin", async () => {
    const response = await request(app.callback())
      .get("/health")
      .set("Origin", "http://localhost:5173");

    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
  });

  it("should fallback to the first dev origin for unauthorized origins", async () => {
    const response = await request(app.callback())
      .get("/health")
      .set("Origin", "http://evil-site.com");

    // In test/dev mode, ALLOWED_ORIGINS[0] is localhost
    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
  });
});
