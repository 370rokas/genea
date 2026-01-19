import { createSourceSubmission } from "@/lib/db";
import logger from "@/lib/logger";
import { checkRateLimit, RateLimitEndpoint, returnLimitedResponse } from "@/lib/security/ratelimit";

interface SubmitSourceResponse {
    ok: boolean;
    message: string;
};

export async function GET() {
    return new Response("Method not allowed", { status: 405 });
}

export async function POST(request: Request) {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("host") || "unknown";
    const shouldRateLimit = checkRateLimit(ip, RateLimitEndpoint.SUBMIT_SOURCE_PROPOSAL);

    if (!shouldRateLimit) {
        return returnLimitedResponse();
    }

    try {
        const body = await request.json();
        const { title, description, link } = body;

        logger.info(`[SOURCE_SUBMIT] New source submission: IP ${request.headers.get("x-forwarded-for") || request.headers.get("host")}, title (${title}), link (${link}), description (${description})`);

        if (!title || !link) {
            return new Response(JSON.stringify({
                ok: false,
                message: "Title and link are required."
            } as SubmitSourceResponse), { status: 400 });
        }

        try {
            await createSourceSubmission(title, description || "", link);

            return new Response(JSON.stringify({
                ok: true,
                message: "Source submitted successfully."
            } as SubmitSourceResponse), { status: 200 });

        } catch (error) {
            return new Response(JSON.stringify({
                ok: false,
                message: "Internal server error."
            } as SubmitSourceResponse), { status: 500 });
        }

    } catch (error) {
        return new Response(JSON.stringify({
            ok: false,
            message: "Internal server error."
        } as SubmitSourceResponse), { status: 500 });
    }
}