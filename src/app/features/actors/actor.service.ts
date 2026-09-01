import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Actor, ActorDetail, ActorInput, ActorPage } from './actor';
import { environment } from '../../../environments/environment';

export interface ActorQuery {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

@Service()
export class ActorService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    listActors(query: ActorQuery): Observable<ActorPage> {
        let params = new HttpParams().set('page', query.page).set('pageSize', query.pageSize);
        if (query.search) params = params.set('search', query.search);
        if (query.sortBy) params = params.set('sortBy', query.sortBy);
        if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
        return this.http.get<ActorPage>(`${this.baseUrl}/actors`, { params });
    }

    getActor(id: number): Observable<ActorDetail> {
        return this.http.get<ActorDetail>(`${this.baseUrl}/actors/${id}`);
    }

    createActor(input: ActorInput): Observable<Actor> {
        return this.http.post<Actor>(`${this.baseUrl}/actors`, input);
    }

    updateActor(id: number, input: ActorInput): Observable<Actor> {
        return this.http.put<Actor>(`${this.baseUrl}/actors/${id}`, input);
    }

    deleteActor(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/actors/${id}`);
    }
}