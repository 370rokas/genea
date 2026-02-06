import { pool } from "@/lib/db";
import { EventType, logEvent } from "@/lib/eventLog";
import { authOptions } from "@/lib/security/auth";
import { hasPermission } from "@/types";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";

interface EditSourceReqBody {
    id: number;
    title: string;
    title_en: string | null;
    description: string;
    description_en: string | null;
    link: string;
    tag_ids: number[];
    location_ids: number[];
    category_id: number | null;
};

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(
        session.user.permissions,
        "MANAGE_SOURCES"
    )) {
        return new Response("Unauthorized", { status: 401 });
    }

    var { id, title, title_en, description, description_en, link, tag_ids, location_ids, category_id }: EditSourceReqBody = await request.json();

    // Make empty strs to nulls so they can be set to null in the db
    if (title_en == "") {
        title_en = null;
    }

    if (description_en == "") {
        description_en = null;
    }

    try {
        logEvent(
            {
                type: EventType.EDIT_SOURCE,
                data: null,
                userId: session.user.id,
                sourceId: id
            }
        );

        const query = `
            UPDATE source
            SET
                title = $1,
                title_en = $2,
                description = $3,
                description_en = $4,
                link = $5,
                category_id = $6
            WHERE id = $7
        `;

        const values = [
            title,
            title_en,
            description,
            description_en,
            link,
            category_id,
            id
        ];
        await pool.query(query, values);

        // Update tags
        await pool.query(
            `DELETE FROM source_tags WHERE source_id = $1`,
            [id]
        );

        for (const tagId of tag_ids) {
            await pool.query(
                `INSERT INTO source_tags (source_id, tag_id) VALUES ($1, $2)`,
                [id, tagId]
            );
        }

        // Update locations
        await pool.query(
            `DELETE FROM source_locations WHERE source_id = $1`,
            [id]
        );

        for (const locationId of location_ids) {
            await pool.query(
                `INSERT INTO source_locations (source_id, location_id) VALUES ($1, $2)`,
                [id, locationId]
            );
        }

        // Invalidate caches
        revalidateTag("sources", "max");

        return new Response("Source updated successfully", { status: 200 });

    } catch (error) {
        return new Response("Internal Server Error", { status: 500 });
    }
}