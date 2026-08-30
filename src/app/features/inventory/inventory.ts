export interface Inventory {
    inventory_id: number;
    title: string;
    store_id: number;
}

export interface InventoryDetail {
    inventory_id: number;
    film_id: number;
    film: { film_id: number; title: string; release_year: number; rental_rate: string };
    rentalCount: number;
}

export interface InventoryPage {
    items: Inventory[];
    total: number;
    page: number;
    pageSize: number;
}

export interface InventoryQuery {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}