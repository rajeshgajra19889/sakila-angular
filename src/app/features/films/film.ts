export interface Film {
    film_id: number;
    title: string;
    release_year: number;
    rental_rate: string;
     language_name?: string | null;
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

export interface FilmInput {
    title: string;
    release_year?: number | null;
    rental_rate?: number | string | null;
}