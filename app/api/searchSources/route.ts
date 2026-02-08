import { checkRateLimit, RateLimitEndpoint, returnLimitedResponse } from "@/lib/security/ratelimit";
import { unstable_cache } from "next/cache";
import { pool } from "@/lib/db";
import { SearchSourcesRequest, SearchSourcesResponseItem } from "@/types";

const getCachedSearch = unstable_cache(
    async (searchQuery: { query: string; args: any[] }) => {
        const { rows } = await pool.query(searchQuery.query, searchQuery.args);
        return rows as SearchSourcesResponseItem[];
    },
    ["sources-search-cache"],
    { revalidate: 60, tags: ["sources"] }
);

function buildSearchQuery(params: SearchSourcesRequest): { query: string; args: any[] } {
    const { query, category, locationIds, tagIds, lang, page } = params;
    const pageSize = 50;
    const pageOffset = (Math.max(1, page) - 1) * pageSize;

    var filterQuery: string = "TRUE";
    var curArgIndex = 1;
    var queryArgs: any[] = [];

    if (category) {
        filterQuery += ` AND category_id = $${curArgIndex}`;
        queryArgs.push(category);
        curArgIndex++;
    }

    if (query) {
        if (lang === "lt") {
            filterQuery += ` AND (title ILIKE $${curArgIndex} OR description ILIKE $${curArgIndex})`;
        } else {
            filterQuery += ` AND (COALESCE(title_en, title) ILIKE $${curArgIndex} OR COALESCE(description_en, description) ILIKE $${curArgIndex})`;
        }
        queryArgs.push(`%${query}%`);
        curArgIndex++;
    }

    if (locationIds && locationIds.length > 0) {
        filterQuery += ` AND EXISTS (
            SELECT 1 FROM source_locations sl 
            WHERE sl.source_id = s.id AND sl.location_id = ANY($${curArgIndex})
        )`;
        queryArgs.push(locationIds);
        curArgIndex++;
    }

    if (tagIds && tagIds.length > 0) {
        filterQuery += ` AND EXISTS (
            SELECT 1 FROM source_tags st 
            WHERE st.source_id = s.id AND st.tag_id = ANY($${curArgIndex})
        )`;
        queryArgs.push(tagIds);
        curArgIndex++;
    }

    var q = `
        SELECT
            s.id,
            ${lang === "lt" ? "s.title" : "COALESCE(s.title_en, s.title) AS title"},
            ${lang === "lt" ? "s.description" : "COALESCE(s.description_en, s.description) AS description"},
            s.link,
            s.category_id,

            (SELECT COALESCE(json_agg(tag_id), '[]') FROM source_tags WHERE source_id = s.id) AS tag_ids,
            (SELECT COALESCE(json_agg(location_id), '[]') FROM source_locations WHERE source_id = s.id) AS location_ids

        FROM source s

        WHERE ${filterQuery}

        ORDER BY s.id ASC
        LIMIT ${pageSize} OFFSET ${pageOffset}
    `;

    return { query: q, args: queryArgs };
}

export async function GET(request: Request) {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("host") || "unknown";
    const shouldRateLimit = checkRateLimit(ip, RateLimitEndpoint.SEARCH_SOURCES);

    if (!shouldRateLimit) {
        return returnLimitedResponse();
    }

    console.log(`[${ip}] Conducting search.`);

    try {
        const { searchParams } = new URL(request.url);
        const params: SearchSourcesRequest = {
            query: searchParams.get("q") || undefined,
            category: Number(searchParams.get("cat")) || undefined,
            locationIds: searchParams.get("locs")?.split(",").map(Number),
            tagIds: searchParams.get("tags")?.split(",").map(Number),
            lang: searchParams.get("lang") || "lt",
            page: Number(searchParams.get("page")) || 1,
        };

        const searchQuery = buildSearchQuery(params);
        const results = await getCachedSearch(searchQuery);

        return Response.json(results);
    } catch (error) {
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
