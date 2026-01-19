import { hasPermission, UpdateUserPayload } from "@/types";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/security/auth";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { EventType, logEvent } from "@/lib/eventLog";
import logger from "@/lib/logger";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    };

    if (!hasPermission(session.user.permissions, "MANAGE_USERS")) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 })
    };

    const data = await request.json() as UpdateUserPayload;

    const targetUsername = data.username;
    const doerUsername = session.user.username;

    const client = await pool.connect();
    const changes: string[] = [];

    try {
        if (data.password) {
            const newHash = await bcrypt.hash(data.password, 10);

            await client.query(
                "UPDATE app_user SET password_hash = $1 WHERE username = $2",
                [newHash, targetUsername]
            );

            logger.info(`[UPD] ${doerUsername} CHANGE PASS FOR ${targetUsername}`);
            changes.push("password");
        }

        if (data.permissions && !data.permissions.includes("SUDO")) {
            await client.query(
                "UPDATE app_user SET permissions = $1 WHERE username = $2",
                [data.permissions, targetUsername]
            );

            logger.info(`[UPD] ${doerUsername} UPDATE PERMS FOR ${targetUsername}`);
            changes.push("permissions");
        }

        return new Response(JSON.stringify({ message: "User updated successfully" }), { status: 200 });
    } catch (error) {
        logger.error("Error updating user:", error);
        return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
    } finally {
        if (changes.length > 0) {
            logEvent({
                type: EventType.UPDATE_USER,
                data: { target: targetUsername, changes },
                userId: session.user.id,
                sourceId: null,
            });
        }

        client.release();
    }
}