import { fetchSourceCategories } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    const categories = await fetchSourceCategories();

    return new Response(
        JSON.stringify(categories),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}