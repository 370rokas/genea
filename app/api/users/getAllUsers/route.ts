import { pool } from "@/lib/db";
import { hasPermission } from "@/types";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/security/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    if (!hasPermission(session.user.permissions, "MANAGE_USERS")) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 })
    }

    const res = await pool.query(
        "SELECT id, username, permissions FROM app_user"
    );

    return new Response(JSON.stringify(res.rows), { status: 200 });
}