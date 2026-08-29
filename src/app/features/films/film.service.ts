import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Film, TopRentedFilm, Page, FilmInput } from './film';
import { Actor } from '../actors/actor';


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
    private readonly baseUrl = 'http://localhost:3000';

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
}