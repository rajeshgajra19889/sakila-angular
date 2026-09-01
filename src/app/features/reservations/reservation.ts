export interface Hold {
    hold_id: number;
    inventory_id: number;
    customer_id: number;
    film_id: number;
    store_id: number;
    expires_at: string;
    created_at: string;
    title: string;
    customer_name: string;
}

export interface HoldPage {
    items: Hold[];
    total: number;
    page: number;
    pageSize: number;
}

export interface HoldInput {
    inventory_id: number;
    customer_id: number;
    expires_at: string;
}

export interface WaitlistEntry {
    waitlist_id: number;
    film_id: number;
    customer_id: number;
    store_id: number | null;
    created_at: string;
    title: string;
    customer_name: string;
}

export interface WaitlistPage {
    items: WaitlistEntry[];
    total: number;
    page: number;
    pageSize: number;
}

export interface WaitlistInput {
    film_id: number;
    customer_id: number;
    store_id: number | null;
}

export interface PromoteInput {
    inventory_id: number;
    days: number;
}

export interface PromoteResult {
    hold_id: number;
    inventory_id: number;
    customer_id: number;
    store_id: number;
    expires_at: string;
    customer_name: string;
}

export interface NameSuggestion {
    id: number;
    label: string;
}