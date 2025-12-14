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
