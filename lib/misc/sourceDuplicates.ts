"use server";

import { cacheTag } from "next/cache";
import { pool } from "@/lib/db";

function minimizeLink(url: string): string {
    if (!url) return url;

    let parsedUrl: URL | null;
    try {
        parsedUrl = new URL(url);
    } catch (e) {
        parsedUrl = null;
    }

    if (parsedUrl) {
        const params: URLSearchParams = parsedUrl.searchParams;

        // Specialios taisykles specifinem svetainem:
        if (parsedUrl.hostname === "epaveldas.lt") {
            // Paliekam id parametra
            const idParam = params.get("id");
            const paramsStr = idParam ? `?id=${idParam}` : "";

            return parsedUrl.hostname + parsedUrl.pathname + paramsStr;
        }

        return parsedUrl.hostname + parsedUrl.pathname;
    } else {
        return url;
    }
}

async function getLinks(): Promise<Map<string, number>> {
    "use cache";
    cacheTag("sources");

    const res = await pool.query(`
      SELECT
        s.id,
        s.link
      FROM
        source s
    `);

    const linkMap: Map<string, number> = new Map();

    res.rows.forEach((row: { id: number; link: string }) => {
        const minimizedLink = minimizeLink(row.link);
        linkMap.set(minimizedLink, row.id);
    });

    return linkMap;
}

export async function searchSimilarUrls(testUrl: string): Promise<number | null> {
    const minimizedTestUrl = minimizeLink(testUrl);
    const linkMap = await getLinks();

    if (linkMap.has(minimizedTestUrl)) {
        return linkMap.get(minimizedTestUrl) || null;
    }

    return null;
}