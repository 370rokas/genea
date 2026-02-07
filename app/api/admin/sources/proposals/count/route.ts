import { authOptions } from "@/lib/security/auth";
import { pool } from "@/lib/db";
import { hasPermission } from "@/types";
import { getServerSession } from "next-auth/next";
import { cacheTag } from "next/cache";

export const dynamic = "force-dynamic";

async function fetchProposalsCount() {
    "use cache";
    cacheTag("source-proposals-count");

    const res = await pool.query<{ count: string }>(`
        SELECT COUNT(*) AS count
        FROM source_submission
    `);

    return parseInt(res.rows[0].count, 10);
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session.user.permissions, "MANAGE_SOURCES")) {
        return new Response("Unauthorized", { status: 401 });
    }

    const count = await fetchProposalsCount();

    return new Response(JSON.stringify({ count: count }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}