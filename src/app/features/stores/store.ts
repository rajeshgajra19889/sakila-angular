export interface StoreManager {
    staff_id: number;
    first_name: string;
    last_name: string;
    email: string | null;
}

export interface StoreAddress {
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

export interface Store {
    store_id: number;
    active: boolean;
    manager: StoreManager;
    staffCount: number;
    inventoryCount: number;
    address: StoreAddress;
}

export interface NewManagerInput {
    first_name: string;
    last_name: string;
    email?: string | null;
}

export interface StoreInput {
    manager_staff_id?: number;
    new_manager_staff?: NewManagerInput;
    address_id?: number;
    active?: boolean;
}

export interface StoreStats {
    store_id: number;
    staffCount: number;
    inventoryCount: number;
    totalRentals: number;
    activeRentals: number;
    revenue: number;
    distinctFilms: number;
    topFilms: { title: string; rentals: number }[];
}

export interface StaffSuggestion {
    staff_id: number;
    first_name: string;
    last_name: string;
    email: string | null;
    store_id: number;
    active: boolean;
    manages_store_id: number | null;
}

export interface AddressSuggestion {
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

export interface AddressInput {
    address: string;
    address2?: string | null;
    district: string;
    city_id: number;
    postal_code?: string | null;
    phone: string;
}

export interface CitySuggestion {
    city_id: number;
    name: string;
    country_name: string;
}

export interface NameSuggestion {
    id: number;
    label: string;
}