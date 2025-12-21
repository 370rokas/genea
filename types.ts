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

export type Permission =
    | "SUDO"
    | "MANAGE_USERS"
    | "MANAGE_SOURCES";

export interface UserData {
    id: number;

    username: string;
    permissions: Permission[];
}

export function hasPermission(
    userPerms: Permission[],
    required?: Permission
) {
    // TODO: Remove
    return true;

    if (!required) return true;
    if (!userPerms || userPerms.length === 0) return false;

    if (userPerms.includes("SUDO")) return true;
    return userPerms.includes(required);
} 
