export interface Film {
    film_id: number;
    title: string;
    description: string | null;
    release_year: number | null;
    language_id: number;
    original_language_id?: number | null;
    rental_duration: number;
    rental_rate: string;
    length: number | null;
    replacement_cost: string;
    rating: string;
    special_features: string[] | null;
    language_name?: string | null;
}

export interface Language {
    language_id: number;
    name: string;
}

export interface FilmInput {
    title: string;
    description?: string | null;
    release_year?: number | null;
    language_id?: number | null;
    rental_duration?: number | null;
    rental_rate?: string | number | null;
    length?: number | null;
    replacement_cost?: string | number | null;
    rating?: string | null;
    special_features?: string[] | null;
}

export interface TopRentedFilm {
    title: string;
    times_rented: string;
}

export interface Page<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}