import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { hasPermission } from "@/types";
import { EventType, logEvent } from "@/lib/eventLog";

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

    try {
        const result = await pool.query(
            "INSERT INTO app_user (username, password_hash) VALUES ($1, $2) RETURNING id, username",
            [username, hash]
        );

        const newUser = result.rows[0];

        logEvent({
            type: EventType.CREATE_USER,
            data: { newId: newUser.id, newUsername: newUser.username },
            userId: session.user.id,
            sourceId: null,
        });

        return new Response(JSON.stringify(newUser), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}