import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { RentalDetail, RentalPage, RentalQuery } from './rental';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Service()
export class RentalService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    listRentals(query: RentalQuery): Observable<RentalPage> {
        let params = new HttpParams().set('page', query.page).set('pageSize', query.pageSize);
        if (query.search) params = params.set('search', query.search);
        if (query.sortBy) params = params.set('sortBy', query.sortBy);
        if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
        return this.http.get<RentalPage>(`${this.baseUrl}/rentals`, { params });
    }

    getRental(id: number): Observable<RentalDetail> {
        return this.http.get<RentalDetail>(`${this.baseUrl}/rentals/${id}`);
    }
}
