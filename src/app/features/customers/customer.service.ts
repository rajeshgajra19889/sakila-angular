import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CustomerDetail, CustomerInput, CustomerPage, CustomerPayment, CustomerQuery } from './customers.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
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

    createCustomer(input: CustomerInput): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/customers`, input);
    }

    updateCustomer(id: number, input: CustomerInput): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/customers/${id}`, input);
    }

    getPaymentHistory(id: number): Observable<CustomerPayment[]> {
        return this.http.get<CustomerPayment[]>(`${this.baseUrl}/payments/${id}`);
    }
}
