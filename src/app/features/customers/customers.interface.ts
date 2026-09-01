export interface Customer {
    customer_id: number;
    first_name: string;
    last_name: string;
    email: string;
    activebool: boolean;
    store_id: number;
}

export interface CustomerRental {
    rental_id: number;
    rental_date: string;
    title: string;
}

export interface CustomerDetail extends Customer {
    address_id: number;
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

export interface CustomerInput {
    first_name: string;
    last_name: string;
    email: string;
    store_id: number;
    address_id: number;
    activebool: boolean;
}
export interface CustomerPayment{
    payment_id:number;
    first_name:string;
    last_name:string
    title:string;
    amount:string | number | null;
    payment_date:string;
}