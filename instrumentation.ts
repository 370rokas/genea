import { revalidateTag } from "next/cache";
import logger from "@/lib/logger";

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        logger.info("Revalidating caches");

        revalidateTag("sources", "max");
        revalidateTag("locations", "max");
        revalidateTag("source-tags", "max");
        revalidateTag("source-categories", "max");
        revalidateTag("source-proposals-count", "max");
    }
}