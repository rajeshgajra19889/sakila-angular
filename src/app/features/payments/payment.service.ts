import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Payment, PaymentPage, PaymentQuery, PaymentInput, PaymentDetail } from './payment';
import { environment } from '../../../environments/environment';

@Service()
export class PaymentService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    listPayments(query: PaymentQuery): Observable<PaymentPage> {
        let params = new HttpParams().set('page', query.page).set('pageSize', query.pageSize);
        if (query.search) params = params.set('search', query.search);
        if (query.customerId) params = params.set('customer_id', query.customerId.toString());
        if (query.storeId) params = params.set('store_id', query.storeId.toString());
        if (query.dateFrom) params = params.set('dateFrom', query.dateFrom);
        if (query.dateTo) params = params.set('dateTo', query.dateTo);
        if (query.sortBy) params = params.set('sortBy', query.sortBy);
        if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
        return this.http.get<PaymentPage>(`${this.baseUrl}/payments`, { params });
    }

    getPayment(id: number): Observable<PaymentDetail> {
        return this.http.get<PaymentDetail>(`${this.baseUrl}/payments/${id}`);
    }

    createPayment(input: PaymentInput): Observable<{ success: boolean; data: Payment }> {
        return this.http.post<{ success: boolean; data: Payment }>(`${this.baseUrl}/payments`, input);
    }

    updatePayment(id: number, input: Partial<PaymentInput>): Observable<{ success: boolean; data: Payment }> {
        return this.http.put<{ success: boolean; data: Payment }>(`${this.baseUrl}/payments/${id}`, input);
    }

    deletePayment(id: number): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/payments/${id}`);
    }
}