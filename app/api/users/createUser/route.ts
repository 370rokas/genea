import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { hasPermission } from "@/types";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    if (!hasPermission(session.user.permissions, "MANAGE_USERS")) {
        return new Response("Forbidden", { status: 403 });
    }

    const { username, password } = await req.json();

    if (!username || !password) {
        return new Response("Missing username or password", { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);
    const client = await pool.connect();

    try {
        const result = await client.query(
            "INSERT INTO app_user (username, password_hash) VALUES ($1, $2) RETURNING id, username",
            [username, hash]
        );

        const newUser = result.rows[0];

        return new Response(JSON.stringify(newUser), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return new Response("Internal Server Error", { status: 500 });
    } finally {
        client.release();
    }
}