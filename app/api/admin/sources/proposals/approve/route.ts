import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";
import { EventType, logEvent } from "@/lib/eventLog";
import { ApproveSourceBody, hasPermission } from "@/types";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";


export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session.user.permissions, "MANAGE_SOURCES")) {
        return new Response("Unauthorized", { status: 401 });
    }

    const body: ApproveSourceBody = await request.json();

    // Create new source
    const createSourceRes = await pool.query<{ id: number }>(`
        INSERT INTO source
            (title, description, link, category_id)
        VALUES
            ($1, $2, $3, $4)
        RETURNING id
    `, [
        body.data.title,
        body.data.description,
        body.data.link,
        body.data.category_id,
    ]);

    revalidateTag("sources", "max");

    const sourceId = createSourceRes.rows[0].id;

    // Link tags
    for (const tagId of body.data.tag_ids) {
        await pool.query(`
            INSERT INTO source_tags
                (source_id, tag_id)
            VALUES
                ($1, $2)
        `, [sourceId, tagId]);
    }

    // Link locations
    for (const locationId of body.data.location_ids) {
        await pool.query(`
            INSERT INTO source_locations
                (source_id, location_id)
            VALUES
                ($1, $2)
        `, [sourceId, locationId]);
    }

    // Delete proposal
    await pool.query(`
        DELETE FROM source_submission
        WHERE id = $1
    `, [body.proposal_id]);

    logEvent({
        type: EventType.APPROVE_SOURCE_PROPOSAL,
        data: { proposalId: body.proposal_id },
        userId: session.user.id,
        sourceId
    })

    return new Response(JSON.stringify({ message: "Source approved", id: sourceId }), { status: 200 });
}