import { pool } from "@/lib/db";
import { authOptions } from "@/lib/security/auth";
import { AdminSourceListing, hasPermission, SourceState } from "@/types";
import { getServerSession } from "next-auth";

async function getData(): Promise<AdminSourceListing[]> {
    //"use cache: remote";
    //cacheTag("sources", "source-state-change");

    const { rows } = await pool.query(`
      SELECT
        s.id,
        s.title,
        s.description,
        s.category_id,
        ARRAY(SELECT location_id FROM source_locations WHERE source_id = s.id) AS location_ids,
        ARRAY(SELECT tag_id FROM source_tags WHERE source_id = s.id) AS tag_ids

      FROM source s
      ORDER BY s.id ASC
    `);

    return rows.map((row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        category_id: row.category_id,
        location_ids: row.location_ids,
        tag_ids: row.tag_ids,
        state: "OK" as SourceState,
    })));
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (
        !session ||
        !hasPermission(session.user.permissions, "MANAGE_SOURCES")
    ) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const listings = await getData();

        return new Response(JSON.stringify(listings), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Error fetching source listings:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}