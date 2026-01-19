import { z } from "zod";

export const schemaFormReportSource = z.object({
    message: z.string().min(1, "Pranešimas yra privalomas"),
    replyTo: z.union([
        z.literal(''),
        z.email({ message: "Įveskite galiojantį el. pašto adresą" }).optional(),
    ]),
});