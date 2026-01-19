import { authOptions } from "@/lib/security/auth";
import { createCategory } from "@/lib/db";
import { EventType, logEvent } from "@/lib/eventLog";
import logger from "@/lib/logger";
import { hasPermission } from "@/types";
import { getServerSession } from "next-auth/next";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(
        session.user.permissions,
        "MANAGE_SOURCES"
    )) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { name } = await request.json();
    if (!name || typeof name !== "string" || name.trim() === "") {
        return new Response("Invalid category name", { status: 400 });
    }

    try {
        const category = await createCategory(name.trim());

        logEvent({
            type: EventType.CREATE_SOURCE_CATEGORY,
            data: { categoryId: category.id },
            userId: session.user.id,
            sourceId: null
        });

        return new Response(
            JSON.stringify(category),
            {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        if (error instanceof Error) {
            // if psql error code for unique violation
            if ((error as any).code === '23505') {
                return new Response("Category already exists", { status: 409 });
            }
        }

        logger.error("Error creating category:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}