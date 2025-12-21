import { Permission } from "@/types";
import NextAuth from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            username: string;
            permissions: Permission[];
        }
    }

    interface User {
        username: string;
        permissions: Permission[]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        username: string
        permissions: Permission[]
    }
}
