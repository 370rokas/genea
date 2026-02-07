import { fetchSourceCategories } from "@/lib/db";



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