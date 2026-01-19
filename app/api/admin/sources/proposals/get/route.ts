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
            ss.submitted_at,
            json_agg(s.*) FILTER (WHERE s.id IS NOT NULL) AS possible_duplicates
            FROM source_submission ss
            LEFT JOIN source s
            ON s.link = ss.link
            GROUP BY ss.id
            ORDER BY ss.submitted_at DESC;`
    );

    const resp: SourceProposal[] = res.rows.map(row => ({
        ...row,
        possible_duplicates:
            row.possible_duplicates?.length ? row.possible_duplicates : undefined
    }));

    return new Response(JSON.stringify(resp), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}