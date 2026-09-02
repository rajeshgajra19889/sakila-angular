import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { RevenueReport, RevenueQuery } from './revenue';
import { environment } from '../../../environments/environment';

@Service()
export class RevenueService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    getReport(query: RevenueQuery = {}): Observable<RevenueReport> {
        let params = new HttpParams();
        if (query.storeId) params = params.set('store_id', query.storeId.toString());
        if (query.customerId) params = params.set('customer_id', query.customerId.toString());
        if (query.dateFrom) params = params.set('dateFrom', query.dateFrom);
        if (query.dateTo) params = params.set('dateTo', query.dateTo);
        return this.http.get<RevenueReport>(`${this.baseUrl}/revenue`, { params });
    }
}