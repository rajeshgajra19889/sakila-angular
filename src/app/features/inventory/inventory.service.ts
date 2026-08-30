import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Inventory, InventoryDetail, InventoryPage, InventoryQuery } from './inventory';

@Service()
export class InventoryService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'http://localhost:3000';

    listInventory(query: InventoryQuery): Observable<InventoryPage> {
        let params = new HttpParams().set('page', query.page).set('pageSize', query.pageSize);
        if (query.search) params = params.set('search', query.search);
        if (query.sortBy) params = params.set('sortBy', query.sortBy);
        if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
        return this.http.get<InventoryPage>(`${this.baseUrl}/inventory`, { params });
    }

    getInventory(id: number): Observable<InventoryDetail> {
        return this.http.get<InventoryDetail>(`${this.baseUrl}/inventory/${id}`);
    }
}