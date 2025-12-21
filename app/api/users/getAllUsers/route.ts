import { pool } from "@/lib/db";
import { hasPermission, Permission } from "@/types";
import { getServerSession } from "next-auth/next";

export async function GET() {
    const session = await getServerSession();

    console.log("111");

    if (!session) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    console.log("222");


    if (!hasPermission(session.user.permissions as Permission[] || [], "MANAGE_USERS")) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 })
    }
    console.log("aasdasd");

    const client = await pool.connect();
    console.log("a");
    const res = await client.query(
        "SELECT id, username, permissions FROM app_user"
    );
    console.log("b")
    return new Response(JSON.stringify(res.rows), { status: 200 });
}