"use server";

import logger from "@/lib/logger";
import { createUserMessage } from "@/lib/messages";
import { createNotif } from "@/lib/notifs";
import { schemaFormReportSource } from "@/lib/zodSchemas";

interface SubmitFormReportSourceResult {
    success: boolean;
    error?: string;
}

export async function submitFormReportSource(formData: FormData, sourceId: number): Promise<SubmitFormReportSourceResult> {
    "use server";

    try {
        const data = schemaFormReportSource.safeParse(Object.fromEntries(formData));

        if (!data.success) {
            throw new Error("Invalid form data.");
        }

        if (!sourceId) {
            throw new Error("Source ID is required.");
        }

        const res = await createUserMessage(data.data.message, data.data.replyTo, sourceId);
        await createNotif(`Naujas pranešimas apie šaltinį (ID: ${sourceId}): ${data.data.message.substring(0, 50)}...`);

        logger.info(`User message created with ID: ${res.id} for source ID: ${sourceId}`);

        return { success: true };
    } catch (error: any) {
        console.error("Error submitting form report source:", error);
        return { success: false, error: error.message || "Unknown error." };
    }
};