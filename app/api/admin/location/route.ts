import { createLocation, pool } from "@/lib/db";
import { EventType, logEvent } from "@/lib/eventLog";
import { authOptions } from "@/lib/security/auth";
import { hasPermission } from "@/types";
import { getServerSession } from "next-auth";

interface CreateLocationBody {
    name: string;
    parentId?: number | null;
}

// POST /api/admin/location - Create a new location
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

        console.error("Error creating location:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

// PUT /api/admin/location - Update location data
export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);

    if (
        !session ||
        !hasPermission(session.user.permissions, "MANAGE_LOCATIONS")
    ) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { id, name, parentId } = await request.json() as { id: number; name?: string; parentId?: number | null };

    if (!id || typeof id !== "number") {
        return new Response("Invalid location ID", { status: 400 });
    }

    if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
        return new Response("Invalid location name", { status: 400 });
    }

    try {
        const res = await pool.query(
            "UPDATE location SET name = COALESCE($1, name), parent_id = COALESCE($2, parent_id) WHERE id = $3 RETURNING id",
            [name, parentId, id]
        );

        if (res.rowCount === 0) {
            return new Response("Location not found", { status: 404 });
        }

        logEvent({
            type: EventType.EDIT_LOCATION,
            data: { locationId: id },
            userId: session.user.id,
            sourceId: null,
        });

        return new Response(JSON.stringify({ id: res.rows[0].id }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        if (error instanceof Error) {
            // PostgreSQL unique violation
            if ((error as any).code === "23505") {
                return new Response("Location name already exists", { status: 409 });
            }
        }

        console.error("Error updating location:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

// DELETE /api/admin/location - Delete a location by ID
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);

    if (
        !session ||
        !hasPermission(session.user.permissions, "MANAGE_LOCATIONS")
    ) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await request.json() as { id: number };

    if (!id || typeof id !== "number") {
        return new Response("Invalid location ID", { status: 400 });
    }

    try {
        const res = await pool.query("DELETE FROM location WHERE id = $1 RETURNING id", [id]);

        if (res.rowCount === 0) {
            return new Response("Location not found", { status: 404 });
        }

        logEvent({
            type: EventType.DELETE_LOCATION,
            data: { locationId: id },
            userId: session.user.id,
            sourceId: null,
        });

        return new Response(JSON.stringify({ id: res.rows[0].id }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error deleting location:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}