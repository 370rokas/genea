"use server";

import { pool } from "@/lib/db";
import { getIP } from "@/lib/utils";
import { headers } from "next/headers";
import { checkRateLimit, RateLimitEndpoint, returnLimitedResponse } from "@/lib/security/ratelimit";

export interface UserMessage {
    id: number;
    message: string;
    reply_to: string | null;
    related_source_id: number | null;
    handled: boolean;
    created_at: string;
};

export async function createUserMessage(message: string, reply_to: string | null = null, related_source_id: number | null = null): Promise<UserMessage> {
    const headerList = await headers();
    const ip = getIP(headerList);

    const shouldLimit = checkRateLimit(ip, RateLimitEndpoint.SEND_MESSAGE);
    if (shouldLimit) {
        return Promise.reject(returnLimitedResponse());
    }

    const res = await pool.query(
        "INSERT INTO user_message (message, reply_to, related_source_id) VALUES ($1, $2, $3) RETURNING id, message, reply_to, related_source_id, handled, created_at",
        [message, reply_to, related_source_id]
    );

    return res.rows[0] as UserMessage;
}