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

export type SourceState = "OK" | "DISABLED";

export interface FullSourceData extends SourceDisplayData {
    title_en: string | null;
    description_en: string | null;

    state: SourceState;
}

export interface AdminSourceListing {
    id: number;
    title: string;
    description: string;
    state: SourceState;
};

export interface DuplicateCheckResponse {
    duplicate: boolean;
    id?: number;
    title?: string | null;
    link?: string | null;
}

export interface ApproveSourceBody {
    proposal_id: number;

    data: {
        title: string;
        description: string;
        link: string;

        category_id: number | null;
        tag_ids: number[];
        location_ids: number[];
    };
};

export interface RemoveSourceBody {
    proposal_id: number;
}

export interface UpdateUserPayload {
    username: string;
    permissions?: Permission[];
    password?: string;
}

export const PERMISSIONS = [
    "SUDO",
    "MANAGE_USERS",
    "MANAGE_SOURCES",
    "MANAGE_LOCATIONS"
] as const;

export type Permission = typeof PERMISSIONS[number];

export interface UserData {
    id: number;

    username: string;
    permissions: Permission[];
}

export interface SourceProposal {
    id: number;

    title: string;
    description: string;
    link: string;
    submitted_at: string;
}

export interface SearchSourcesRequest {
    query?: string;
    category?: number;
    locationIds?: number[];
    tagIds?: number[];
    lang: string;
    page: number;
}

export interface SearchSourcesResponseItem {
    id: number;
    title: string;
    description: string;
    link: string;
    category_id: number | null;
    tag_ids: number[];
    location_ids: number[];
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
