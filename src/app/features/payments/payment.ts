export interface Payment {
    payment_id: number;
    customer_id: number;
    first_name: string;
    last_name: string;
    staff_name: string;
    store_id: number | null;
    title: string | null;
    amount: string;
    payment_date: string;
}

export interface PaymentPage {
    items: Payment[];
    total: number;
    page: number;
    pageSize: number;
}

export interface PaymentQuery {
    page: number;
    pageSize: number;
    search?: string;
    customerId?: number;
    storeId?: number;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaymentInput {
    customer_id: number;
    staff_id?: number | null;
    rental_id?: number | null;
    amount: number;
    payment_date: string;
}

export interface PaymentDetail {
    payment_id: number;
    customer_id: number;
    customer_name: string;
    staff_id: number | null;
    staff_name: string | null;
    rental_id: number | null;
    film: string | null;
    amount: string;
    payment_date: string;
}