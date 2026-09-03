export interface Country {
    country_id: number;
    name: string;
}

export interface City {
    city_id: number;
    name: string;
    country_id: number;
    country_name: string;
}

export interface CityInput {
    name: string;
    country_id: number;
}