import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AddressService {
    private http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:3000';

    searchAddresses(q: { search?: string; pageSize?: number }) {
        let params = new HttpParams();
        if (q.search) params = params.set('search', q.search);
        if (q.pageSize) params = params.set('pageSize', q.pageSize.toString());
        return this.http.get<any>(`${this.baseUrl}/addresses`, { params });
    }
}
