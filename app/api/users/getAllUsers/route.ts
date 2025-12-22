import { pool } from "@/lib/db";
import { hasPermission } from "@/types";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        console.log("No session found");
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    if (!hasPermission(session.user.permissions, "MANAGE_USERS")) {
        console.log("Insufficient permissions");
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 })
    }

    const res = await pool.query(
        "SELECT id, username, permissions FROM app_user"
    );

    return new Response(JSON.stringify(res.rows), { status: 200 });
}