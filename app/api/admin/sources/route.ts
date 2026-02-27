import { FormSubmitData } from "@/components/admin/editSourceForm";
import { pool } from "@/lib/db";
import { logEvent } from "@/lib/eventLog";
import { EventType } from "@/types/api";
import { authOptions } from "@/lib/security/auth";
import { hasPermission } from "@/types";
import { getServerSession } from "next-auth/next";
import { revalidateTag } from "next/cache";

// POST /api/admin/sources - create a new source
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (
        !session ||
        !hasPermission(session.user.permissions, "MANAGE_SOURCES")
    ) {
        return new Response("Unauthorized", { status: 401 });
    }

    // type FormSubmitData
    const data = await request.json() as FormSubmitData;

    console.log(`[CREATE_SOURCE] ${session.user.username} creating: ${JSON.stringify(data)}`);

    // Create new source
    const createSourceRes = await pool.query<{ id: number }>(`
            INSERT INTO source
                (title, description, link, category_id)
            VALUES
                ($1, $2, $3, $4)
            RETURNING id
        `, [
        data.title,
        data.description,
        data.link,
        data.category_id,
    ]);

    revalidateTag("sources", "max");

    const sourceId = createSourceRes.rows[0].id;

    // Link tags
    for (const tagId of data.tag_ids) {
        await pool.query(`
                INSERT INTO source_tags
                    (source_id, tag_id)
                VALUES
                    ($1, $2)
            `, [sourceId, tagId]);
    }

    // Link locations
    for (const locationId of data.location_ids) {
        await pool.query(`
                INSERT INTO source_locations
                    (source_id, location_id)
                VALUES
                    ($1, $2)
            `, [sourceId, locationId]);
    }

    logEvent({
        type: EventType.CREATE_SOURCE,
        sourceId: sourceId,
        userId: session.user.id,
        data: {}
    });

    return new Response(JSON.stringify({ id: sourceId }), { status: 201 });
}