import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { CustomerDetail, CustomerPage, CustomerQuery } from './customers.interface';
import { Observable } from 'rxjs';

@Service()
export class CustomerService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:3000';

    listCustomers(query: CustomerQuery): Observable<CustomerPage> {
        let params = new HttpParams().set('page', query.page).set('pageSize', query.pageSize);
        if (query.search) params = params.set('search', query.search);
        if (query.sortBy) params = params.set('sortBy', query.sortBy);
        if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
        return this.http.get<CustomerPage>(`${this.baseUrl}/customers`, { params });
    }

    getCustomer(id: number): Observable<CustomerDetail> {
        return this.http.get<CustomerDetail>(`${this.baseUrl}/customers/${id}`);
    }
}
