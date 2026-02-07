import { pool } from "@/lib/db";
import logger from "@/lib/logger";

export enum EventType {
    LOGIN = "login",
    CHANGE_PASSWORD = "change_password",
    CREATE_USER = "create_user",
    UPDATE_USER = "update_user",

    CREATE_LOCATION = "create_location",
    CREATE_SOURCE_CATEGORY = "create_source_category",
    CREATE_SOURCE_TAG = "create_source_tag",

    APPROVE_SOURCE_PROPOSAL = "approve_source_proposal",
    REMOVE_SOURCE_PROPOSAL = "remove_source_proposal",

    PUSH_EMAILS = "push_emails",

    EDIT_SOURCE = "edit_source",
};

interface LogEventProps {
    type: EventType;
    data: Object | null;
    userId: number | null;
    sourceId: number | null;
};

export async function logEvent({ type, data, userId, sourceId }: LogEventProps): Promise<void> {
    try {
        await pool.query(
            'INSERT INTO event_log (event_type, event_data, event_related_user, event_related_source) VALUES ($1, $2, $3, $4)',
            [type, data, userId, sourceId]
        );
    } catch (error) {
        logger.error('Error logging event:', error);
    }
};
