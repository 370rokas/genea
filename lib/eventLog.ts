import { pool } from "@/lib/db";
import { EventType } from "@/types/api";

export interface LogEventProps {
    type: EventType;
    data: Object | null;
    userId: number | null;
    sourceId: number | null;
};

export async function logEvent({ type, data, userId, sourceId }: LogEventProps): Promise<void> {
    try {
        if (!data) data = {};

        await pool.query(
            'INSERT INTO event_log (event_type, event_data, event_related_user, event_related_source) VALUES ($1, $2, $3, $4)',
            [type, data, userId, sourceId]
        );
    } catch (error) {
        console.error('Error logging event:', error);
    }
};
