export interface Staff {
    staff_id: number;
    first_name: string;
    last_name: string;
    address:StaffAddress;
    email: string|null;
    store_id: number;
    active: boolean;
    username: string;
}
export interface StaffQuery {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface StaffPage {
    items: Staff[];
    total: number;
    page: number;
    pageSize: number;
}
export interface StaffAddress {
    address_id: number;
    address: string;
    address2: string | null;
    district: string;
    postal_code: string | null;
    phone: string;
    city_id: number;
    city_name: string;
    country_name: string;
}

export interface StaffInput {
    first_name: string;
    last_name: string;
    email?: string | null;
    username: string;
    password: string;
    store_id: number;
    address_id: number;
    active?: boolean;
}

export interface StaffDetail {
    staff_id: number;
    first_name: string;
    last_name: string;
    email: string | null;
    store_id: number;
    active: boolean;
    username: string;
    address_id: number;
    address?: {
        address_id: number;
        address: string;
        district: string;
        city_name: string;
        country_name: string;
    } | null;
}