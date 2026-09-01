import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Hold, HoldInput, HoldPage, PromoteInput, PromoteResult, WaitlistEntry, WaitlistInput, WaitlistPage } from './reservation';

interface PageQuery {
    page: number;
    pageSize: number;
    search?: string;
}

function pagination(query: PageQuery): HttpParams {
    let params = new HttpParams().set('page', query.page).set('pageSize', query.pageSize);
    if (query.search) params = params.set('search', query.search);
    return params;
}

@Service()
export class ReservationService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:3000';

    listHolds(query: PageQuery): Observable<HoldPage> {
        return this.http.get<HoldPage>(`${this.baseUrl}/holds`, { params: pagination(query) });
    }

    createHold(input: HoldInput): Observable<Hold> {
        return this.http.post<Hold>(`${this.baseUrl}/holds`, input);
    }

    releaseHold(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/holds/${id}`);
    }

    listWaitlist(query: PageQuery): Observable<WaitlistPage> {
        return this.http.get<WaitlistPage>(`${this.baseUrl}/waitlist`, { params: pagination(query) });
    }

    addToWaitlist(input: WaitlistInput): Observable<WaitlistEntry> {
        return this.http.post<WaitlistEntry>(`${this.baseUrl}/waitlist`, input);
    }

    removeFromWaitlist(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/waitlist/${id}`);
    }

    promoteWaitlist(input: PromoteInput): Observable<PromoteResult> {
        return this.http.post<PromoteResult>(`${this.baseUrl}/waitlist/promote`, input);
    }
}