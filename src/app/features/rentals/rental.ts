export interface Rental {
    rental_id: number;
    rental_date: string;
    return_date: string | null;
    title: string;
    customer_name: string;
}

export interface RentalDetail {
    rental_id: number;
    rental_date: string;
    return_date: string | null;
    inventory_id: number;
    store_id: number;
    customer: { customer_id: number; first_name: string; last_name: string; email: string };
    film: { film_id: number; title: string; release_year: number; rental_rate: string };
}

export interface RentalPage {
    items: Rental[];
    total: number;
    page: number;
    pageSize: number;
}

export interface RentalQuery {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}