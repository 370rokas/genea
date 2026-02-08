import { NextResponse } from "next/server";

export enum RateLimitEndpoint {
    SEND_MESSAGE = 1,
    SUBMIT_SOURCE_PROPOSAL = 2,
    SEARCH_SOURCES = 3,
}

const rateLimitConfig: Record<RateLimitEndpoint, { allowed: number; duration: number }> = {
    [RateLimitEndpoint.SEND_MESSAGE]: { allowed: 3, duration: 60 }, // 3 requests per minute
    [RateLimitEndpoint.SUBMIT_SOURCE_PROPOSAL]: { allowed: 6, duration: 60 }, // 3 requests per minute
    [RateLimitEndpoint.SEARCH_SOURCES]: { allowed: 60, duration: 60 }, // 1 request per second
}

const rateLimitData: Record<string, Record<RateLimitEndpoint, { count: number; lastReset: number }>> = {};

export function checkRateLimit(ip: string, endpoint: RateLimitEndpoint): boolean {
    const now = Date.now();
    const config = rateLimitConfig[endpoint];

    if (!rateLimitData[ip]) {
        rateLimitData[ip] = {} as Record<RateLimitEndpoint, { count: number; lastReset: number }>;
    }

    const userLimits = rateLimitData[ip];

    if (!userLimits[endpoint]) {
        userLimits[endpoint] = { count: 1, lastReset: now };
        return true;
    }

    const limitData = userLimits[endpoint];

    if (now - limitData.lastReset > config.duration * 1000) {
        limitData.count = 0;
        limitData.lastReset = now;
    }

    if (limitData.count < config.allowed) {
        limitData.count += 1;
        return true;
    }

    return false;
}

export function returnLimitedResponse(): NextResponse {
    return NextResponse.json({ success: false, error: "Too many requests. Please try again later." }, { status: 429 });
}