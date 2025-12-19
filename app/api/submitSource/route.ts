import { createSourceSubmission } from "@/lib/db";

interface SubmitSourceResponse {
    ok: boolean;
    message: string;
};

export async function GET() {
    return new Response("Method not allowed", { status: 405 });
}

export async function POST(request: Request) {

    try {
        const body = await request.json();
        const { title, description, link } = body;

        console.log(`IP ${request.headers.get("x-forwarded-for") || request.headers.get("host")} source submit: title (${title}), link (${link}), description (${description})`);

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