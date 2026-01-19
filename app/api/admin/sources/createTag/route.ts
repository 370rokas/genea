import { authOptions } from "@/lib/security/auth";
import { createTag } from "@/lib/db";
import { EventType, logEvent } from "@/lib/eventLog";
import logger from "@/lib/logger";
import { hasPermission } from "@/types";
import { getServerSession } from "next-auth/next";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (
        !session ||
        !hasPermission(session.user.permissions, "MANAGE_SOURCES")
    ) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { name } = await request.json();
    if (!name || typeof name !== "string" || name.trim() === "") {
        return new Response("Invalid tag name", { status: 400 });
    }

    try {
        const tag = await createTag(name.trim());

        logEvent({
            type: EventType.CREATE_SOURCE_TAG,
            data: { tagId: tag.id },
            userId: session.user.id,
            sourceId: null,
        })

        return new Response(
            JSON.stringify(tag),
            {
                status: 201,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        if (error instanceof Error) {
            // PostgreSQL unique violation
            if ((error as any).code === "23505") {
                return new Response("Tag already exists", { status: 409 });
            }
        }

        logger.error("Error creating tag:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}