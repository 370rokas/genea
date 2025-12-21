import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { pool } from "@/lib/db"

export const authOptions = {
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "slapyvardis" },
                password: { label: "Password", type: "password", plachorder: "slaptažodis" }
            },
            async authorize(credentials) {
                const { username, password } = credentials as { username: string; password: string }
                const client = await pool.connect()

                const res = await client.query(
                    "SELECT id, username, password_hash, permissions FROM app_user WHERE username = $1",
                    [username]
                )

                client.release()
                const users = res.rows as {
                    id: number;
                    username: string;
                    password_hash: string;
                    permissions: string[];
                }[];

                if (users.length === 0) {
                    return null;
                }

                const user = users[0];

                const isPasswordValid = await bcrypt.compare(password, user.password_hash);

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id.toString(),
                    username: user.username,
                    permissions: user.permissions
                }
            }
        })
    ],
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }