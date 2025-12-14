import { fetchDisplaySources } from "@/lib/db";

export async function GET() {
    const locations = await fetchDisplaySources();
    
    return new Response(
        JSON.stringify(locations),
        { headers: {
            'Content-Type': 'application/json'
        }}
    );
}