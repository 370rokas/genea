import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { pool } from "@/lib/db";
import { Permission } from "@/types";
import bcrypt from "bcryptjs";
import { EventType, logEvent } from "@/lib/eventLog";

export const authOptions: NextAuthOptions = {
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "slapyvardis" },
                password: { label: "Password", type: "password", placeholder: "slaptažodis" }
            },
            async authorize(credentials) {
                const { username, password } = credentials as { username: string; password: string }

                const res = await pool.query(
                    "SELECT id, username, password_hash, permissions FROM app_user WHERE username = $1",
                    [username]
                )

                const users = res.rows as {
                    id: number;
                    username: string;
                    password_hash: string;
                    permissions: Permission[];
                }[];

                if (users.length === 0) {
                    return null;
                }

                const user = users[0];

                const isPasswordValid = await bcrypt.compare(password, user.password_hash);

                if (!isPasswordValid) {
                    return null;
                }

                logEvent({
                    type: EventType.LOGIN,
                    data: null,
                    userId: user.id,
                    sourceId: null
                })

                return {
                    id: user.id as number,
                    username: user.username,
                    permissions: user.permissions
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as number
                token.username = user.username
                token.permissions = user.permissions
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id
                session.user.username = token.username
                session.user.permissions = token.permissions
            }
            return session
        }
    }
}