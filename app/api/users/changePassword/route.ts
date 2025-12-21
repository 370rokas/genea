import { getServerSession } from "next-auth";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";


export default async function POST(req: Request) {
    const session = await getServerSession();

    if (!session) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const { newPassword: string } = await req.json();
    const username = session.user?.name;

    if (!username) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const newHashedPassword = await bcrypt.hash(string, 10);

    await pool.query("UPDATE users SET password_hash = ? WHERE username = ?", [newHashedPassword, username]);

    return new Response(JSON.stringify({ message: "OK" }), { status: 200 });
}