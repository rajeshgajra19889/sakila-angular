import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Inventory, InventoryDetail, InventoryPage, InventoryQuery, StockSummaryPage, StockSummaryRow, Renter } from './inventory';
import { environment } from '../../../environments/environment';

@Service()
export class InventoryService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    listInventory(query: InventoryQuery): Observable<InventoryPage> {
        let params = new HttpParams().set('page', query.page).set('pageSize', query.pageSize);
        if (query.search) params = params.set('search', query.search);
        if (query.storeId) params = params.set('store_id', query.storeId);
        if (query.sortBy) params = params.set('sortBy', query.sortBy);
        if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
        return this.http.get<InventoryPage>(`${this.baseUrl}/inventory`, { params });
    }

    getInventory(id: number): Observable<InventoryDetail> {
        return this.http.get<InventoryDetail>(`${this.baseUrl}/inventory/${id}`);
    }

        createStock(input: { film_id: number; store_id: number; qty: number }): Observable<{ created: number }> {
        return this.http.post<{ created: number }>(`${this.baseUrl}/inventory`, input);
    }

    moveCopy(id: number, storeId: number): Observable<{ inventory_id: number; store_id: number }> {
        return this.http.post<{ inventory_id: number; store_id: number }>(`${this.baseUrl}/inventory/${id}/move`, { store_id: storeId });
    }

    getStockSummary(query: { page: number; pageSize: number; search?: string; storeId?: number }): Observable<StockSummaryPage> {
        let params = new HttpParams().set('page', query.page).set('pageSize', query.pageSize);
        if (query.search) params = params.set('search', query.search);
        if (query.storeId) params = params.set('store_id', query.storeId);
        return this.http.get<StockSummaryPage>(`${this.baseUrl}/inventory/summary`, { params });
    }

    getRenters(filmId: number, storeId: number): Observable<Renter[]> {
        return this.http.get<Renter[]>(`${this.baseUrl}/inventory/renters`, {
            params: new HttpParams().set('film_id', filmId).set('store_id', storeId)
        });
    }
}