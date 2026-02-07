import { getServerSession } from "next-auth";

import { pool } from "@/lib/db";
import { authOptions } from "@/lib/security/auth";
import { hasPermission, SourceProposal } from "@/types";



export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session.user.permissions, "MANAGE_SOURCES")) {
        return new Response("Unauthorized", { status: 401 });
    }

    const res = await pool.query(
        `SELECT
            ss.id,
            ss.title,
            ss.description,
            ss.link,
            ss.submitted_at
            FROM source_submission ss
            GROUP BY ss.id
            ORDER BY ss.submitted_at DESC;`
    );

    const resp: SourceProposal[] = res.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        link: row.link,
        submitted_at: row.submitted_at,
    }));

    return new Response(JSON.stringify(resp), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}