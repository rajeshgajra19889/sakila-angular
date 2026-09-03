export interface Inventory {
    inventory_id: number;
    title: string;
    store_id: number;
    rented: boolean;
    held: boolean;
}

export interface InventoryDetail {
    inventory_id: number;
    film_id: number;
    store_id: number;
    film: { film_id: number; title: string; release_year: number; rental_rate: string };
    rentalCount: number;
    rented: boolean;
    held: boolean;
}

export interface StockSummaryRow {
    film_id: number;
    store_id: number;
    title: string;
    copies: number;
    rented: number;
    held: number;
    available: number;
}

export interface StockSummaryPage {
    items: StockSummaryRow[];
    total: number;
    page: number;
    pageSize: number;
}

export interface Renter {
    inventory_id: number;
    customer_id: number;
    customer_name: string;
    rental_date: string;
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
    storeId?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}