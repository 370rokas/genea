import { pool } from "@/lib/db";
import logger from "@/lib/logger";
import { searchSimilarUrls } from "@/lib/misc/sourceDuplicates";
import { authOptions } from "@/lib/security/auth";
import { DuplicateCheckResponse, hasPermission } from "@/types";
import { getServerSession } from "next-auth";

export async function GET(request: Request): Promise<Response> {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session.user.permissions, "MANAGE_SOURCES")) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const testLink = searchParams.get("link");

    if (!testLink) {
        return new Response(
            JSON.stringify({ error: "Missing 'link' query parameter." }),
            { status: 400 }
        );
    }

    try {
        const duplicateSourceId = await searchSimilarUrls(testLink);

        if (duplicateSourceId !== null) {
            const res = await pool.query(
                `SELECT title, link FROM source WHERE id = $1`, [duplicateSourceId]
            )

            return new Response(
                JSON.stringify({
                    duplicate: true,
                    id: duplicateSourceId,
                    title: res.rows[0]?.title || null,
                    link: res.rows[0]?.link || null,
                } as DuplicateCheckResponse),
                { status: 200 }
            );
        } else {
            return new Response(
                JSON.stringify({ duplicate: false } as DuplicateCheckResponse),
                { status: 200 }
            );
        }
    } catch (error) {
        logger.error("Error checking for duplicate source link:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error." }),
            { status: 500 }
        );
    }
}