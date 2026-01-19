import { getServerSession } from "next-auth";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/security/auth";
import { EventType, logEvent } from "@/lib/eventLog";


export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const { newPassword: string } = await req.json();
    const username = session.user.username;

    if (!username) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const newHashedPassword = await bcrypt.hash(string, 10);

    await pool.query("UPDATE users SET password_hash = ? WHERE username = ?", [newHashedPassword, username]);

    logEvent({
        type: EventType.CHANGE_PASSWORD,
        data: null,
        userId: session.user.id,
        sourceId: null,
    });

    return new Response(JSON.stringify({ message: "OK" }), { status: 200 });
}