import { pool } from "@/lib/db";

export enum EventType {
    LOGIN = "login",

    CREATE_USER = "create_user",
    UPDATE_USER = "update_user",
    CHANGE_PASSWORD = "change_password",

    CREATE_SOURCE = "create_source",
    CREATE_LOCATION = "create_location",
    CREATE_SOURCE_CATEGORY = "create_source_category",
    CREATE_SOURCE_TAG = "create_source_tag",

    EDIT_SOURCE = "edit_source",
    EDIT_LOCATION = "edit_location",
    EDIT_SOURCE_CATEGORY = "edit_source_category",
    EDIT_SOURCE_TAG = "edit_source_tag",

    DELETE_LOCATION = "delete_location",
    DELETE_SOURCE_CATEGORY = "delete_source_category",
    DELETE_SOURCE_TAG = "delete_source_tag",

    APPROVE_SOURCE_PROPOSAL = "approve_source_proposal",
    REMOVE_SOURCE_PROPOSAL = "remove_source_proposal",

    PUSH_EMAILS = "push_emails",
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
        console.error('Error logging event:', error);
    }
};
