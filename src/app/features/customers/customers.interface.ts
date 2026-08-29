export interface Customer {
    customer_id: number;
    first_name: string;
    last_name: string;
    email: string;
    active: boolean;
    store_id: number;
}

export interface CustomerRental {
    rental_id: number;
    rental_date: string;
    title: string;
}

export interface CustomerDetail extends Customer {
    rentals: CustomerRental[];
    rentalCount: number;
}

export interface CustomerPage {
    items: Customer[];
    total: number;
    page: number;
    pageSize: number;
}

export interface CustomerQuery {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}