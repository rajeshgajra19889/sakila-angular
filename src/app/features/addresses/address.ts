export interface Address {
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