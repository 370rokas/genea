import { Permission } from "@/types";
import NextAuth from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: number;
            username: string;
            permissions: Permission[];
        }
    }

    interface User {
        id: number;
        username: string;
        permissions: Permission[]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: number
        username: string
        permissions: Permission[]
    }
}
