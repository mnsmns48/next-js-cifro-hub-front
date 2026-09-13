export interface HubLevel {
    id: number;
    sort_order: number;
    label: string;
    icon: string | null;
    slug?: string | null;
    parent_id: number;
    depth: number;
}