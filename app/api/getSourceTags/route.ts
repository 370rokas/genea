import { fetchSourceTags } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    const tags = await fetchSourceTags();

    return new Response(
        JSON.stringify(tags),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}