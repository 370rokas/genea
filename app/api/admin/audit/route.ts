import { pool } from "@/lib/db";
import { authOptions } from "@/lib/security/auth";
import { hasPermission } from "@/types";
import { EventLogEntry } from "@/types/api";
import { getServerSession } from "next-auth";

export interface AuditLogQueryParams {
    page?: number;
    event_type?: string[];
    related_user_id?: number[];
    related_source_id?: number;
};

export interface AuditLogQueryResult {
    hasMore: boolean;
    logs: EventLogEntry[];
}

// POST /api/admin/audit - Queries audit logs.
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (
        !session ||
        !hasPermission(session.user.permissions, "SUDO")
    ) {
        return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const queryParams: AuditLogQueryParams = {
        page: body.page,
        event_type: body.event_type,
        related_user_id: body.related_user_id,
        related_source_id: body.related_source_id,
    };

    console.log(queryParams)

    var queryString = `
        SELECT event_type, event_data, event_related_user, event_related_source, event_time
        FROM event_log
        WHERE 1=1
    `;

    const queryValues: any[] = [];

    if (queryParams.event_type && queryParams.event_type.length > 0) {
        queryValues.push(queryParams.event_type);
        queryString += ` AND UPPER(event_type) = ANY($${queryValues.length}::text[])`;
    }

    if (queryParams.related_user_id && queryParams.related_user_id.length > 0) {
        queryValues.push(queryParams.related_user_id);
        queryString += ` AND event_related_user = ANY($${queryValues.length}::int[])`;
    }

    if (queryParams.related_source_id) {
        queryValues.push(queryParams.related_source_id);
        queryString += ` AND event_related_source = $${queryValues.length}::bigint`;
    }

    // Pagination
    const pageSize = 50;
    const offset = ((queryParams.page || 1) - 1) * pageSize;
    queryValues.push(pageSize, offset);
    queryString += ` ORDER BY event_time DESC LIMIT $${queryValues.length - 1} OFFSET $${queryValues.length}`;

    try {
        const { rows } = await pool.query(queryString, queryValues);

        // convert event_time to UNIX timestamp 
        rows.forEach((row) => {
            row.event_time = Math.floor(new Date(row.event_time).getTime() / 1000);
        });

        // make rows match
        const convertedRows = rows.map((row) => {
            return {
                type: row.event_type,
                data: row.event_data,
                userId: row.event_related_user,
                sourceId: row.event_related_source,
                timestamp: row.event_time
            };
        });

        return new Response(JSON.stringify({
            hasMore: rows.length === pageSize,
            logs: convertedRows
        }), {
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (error) {
        console.error("Error querying audit logs:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
};

