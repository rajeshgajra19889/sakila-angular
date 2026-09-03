import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Film, TopRentedFilm, Page, FilmInput, Language, FilmInventoryCopy } from './film';
import { Actor } from '../actors/actor';
import { Category } from '../categories/category';
import { environment } from '../../../environments/environment';


export interface FilmQuery {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

@Service()
export class FilmService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    listFilms(query: FilmQuery): Observable<Page<Film>> {
        let params = new HttpParams()
            .set('page', query.page)
            .set('pageSize', query.pageSize);
        if (query.search) params = params.set('search', query.search);
        if (query.sortBy) params = params.set('sortBy', query.sortBy);
        if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
        return this.http.get<Page<Film>>(`${this.baseUrl}/films`, { params });
    }

    listTopRented(): Observable<TopRentedFilm[]> {
        return this.http.get<TopRentedFilm[]>(`${this.baseUrl}/top-rented`);
    }

    getFilm(id: number): Observable<Film> {
        return this.http.get<Film>(`${this.baseUrl}/films/${id}`);
    }

    getLanguages(): Observable<Language[]> {
        return this.http.get<Language[]>(`${this.baseUrl}/languages`);
    }

    createFilm(input: FilmInput): Observable<Film> {
        return this.http.post<Film>(`${this.baseUrl}/films`, input);
    }

    updateFilm(id: number, input: FilmInput): Observable<Film> {
        return this.http.put<Film>(`${this.baseUrl}/films/${id}`, input);
    }

    deleteFilm(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/films/${id}`);
    }

    getFilmActors(id: number): Observable<Actor[]> {
        return this.http.get<Actor[]>(`${this.baseUrl}/films/${id}/actors`);
    }

    setFilmActors(id: number, actorIds: number[]): Observable<Actor[]> {
        return this.http.put<Actor[]>(`${this.baseUrl}/films/${id}/actors`, { actor_ids: actorIds });
    }

    getFilmCategories(id: number): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.baseUrl}/films/${id}/categories`);
    }

    setFilmCategories(id: number, categoryIds: number[]): Observable<Category[]> {
        return this.http.put<Category[]>(`${this.baseUrl}/films/${id}/categories`, { category_ids: categoryIds });
    }

    listCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.baseUrl}/categories`);
    }

    getFilmInventory(id: number): Observable<FilmInventoryCopy[]> {
        return this.http.get<FilmInventoryCopy[]>(`${this.baseUrl}/films/${id}/inventory`);
    }

    addFilmInventory(id: number, input: { store_id: number; qty: number }): Observable<{ created?: number; message?: string }> {
        return this.http.post<{ created?: number; message?: string }>(`${this.baseUrl}/films/${id}/inventory`, input);
    }

    deleteInventoryCopy(inventoryId: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/inventory/${inventoryId}`);
    }
}