export const runtime = 'nodejs';

import { ensureSchema } from "@/lib/db";

export function register() {
    ensureSchema().catch(err => {
        console.error('Failed to ensure database schema:', err);
        process.exit(1);
    }).then(() => {
        console.log('Database schema ensured');
    });
}