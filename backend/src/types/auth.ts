import { Context } from "koa";

export const PERMISSIONS = [
  "SUDO",
  "MANAGE_USERS",
  "MANAGE_SOURCES",
  "MANAGE_LOCATIONS",
  "MANAGE_MESSAGES",
] as const;

export interface AuthContext extends Context {
  state: {
    user?: {
      id: string;
      role: string;
    };
  };
}

export type Permission = (typeof PERMISSIONS)[number];

export interface TokenPayload {
  id: number;
  username: string;
  permissions: Permission[];
}
