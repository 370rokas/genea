export interface SourceTag {
    id: number;
    name: string;
}

export interface SourceCategory {
    id: number;
    name: string;
}

export interface LocationData {
    id: number;
    name: string;
}

export interface SourceDisplayData {
    id: number;

    title: string;
    description: string;
    link: string;

    category: SourceCategory;
    tags: SourceTag[];
    locations: LocationData[];
};

export interface UpdateUserPayload {
    username: string;
    permissions?: Permission[];
    password?: string;
}

export const PERMISSIONS = [
    "SUDO",
    "MANAGE_USERS",
    "MANAGE_SOURCES",
] as const;

export type Permission = typeof PERMISSIONS[number];

export interface UserData {
    id: number;

    username: string;
    permissions: Permission[];
}

export function hasPermission(
    userPerms: Permission[],
    required?: Permission
) {
    if (!required) return true;
    if (!userPerms || userPerms.length === 0) return false;

    if (userPerms.includes("SUDO")) return true;
    return userPerms.includes(required);
} 
