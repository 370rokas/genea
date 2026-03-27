import { pool } from "@/utils/db";
import { describe, it } from "vitest";

describe("Util Tests", () => {
  it("should cover the DB error listener", () => {
    // We emit a fake error to the pool to trigger the code in db.ts
    const mockError = new Error("Test Error");
    pool.emit("error", mockError);
  });
});
