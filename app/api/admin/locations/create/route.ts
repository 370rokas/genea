import { authOptions } from "@/lib/security/auth";
import { createLocation } from "@/lib/db";
import { EventType, logEvent } from "@/lib/eventLog";
import logger from "@/lib/logger";
import { hasPermission } from "@/types";
import { getServerSession } from "next-auth/next";

interface CreateLocationBody {
    name: string,
    parentId?: number
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (
        !session ||
        !hasPermission(session.user.permissions, "MANAGE_LOCATIONS")
    ) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { name, parentId } = await request.json() as CreateLocationBody;

    if (!name || typeof name !== "string" || name.trim() === "") {
        return new Response("Invalid location name", { status: 400 });
    }

    try {
        const location = await createLocation(name, parentId);

        logEvent(
            {
                type: EventType.CREATE_LOCATION,
                data: { locationId: location.id },
                userId: session.user.id,
                sourceId: null
            }
        );

        return new Response(
            JSON.stringify(location),
            {
                status: 201,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        if (error instanceof Error) {
            // PostgreSQL unique violation
            if ((error as any).code === "23505") {
                return new Response("Location already exists", { status: 409 });
            }
        }

        logger.error("Error creating location:", error);
        return new Response("Internal Server Error", { status: 500 });
    }

}