import { pool } from "@/lib/db";

const DB_SCHEMA_FILE = "../database_schema.sql";

async function pushDb() {
    const client = await pool.connect();

    try {
        const fs = await import("fs");
        const path = await import("path");
        const schemaSql = fs.readFileSync(path.resolve(__dirname, DB_SCHEMA_FILE), "utf-8");
        await client.query(schemaSql);
        console.log("Database schema pushed successfully.");
    } catch (error) {
        console.error("Error pushing database schema:", error);
    } finally {
        client.release();
    }
}

pushDb()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });