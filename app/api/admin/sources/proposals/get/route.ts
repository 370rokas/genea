import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";
import { hasPermission } from "@/types";
import { getServerSession } from "next-auth";


export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session.user.permissions, "MANAGE_SOURCES")) {
        return new Response("Unauthorized", { status: 401 });
    }

    const res = await pool.query(
        `SELECT id, title, description, link, submitted_at
            FROM source_submission
            ORDER BY submitted_at DESC`
    );

    const proposals = res.rows;

    return new Response(JSON.stringify(proposals), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}