import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import {
    AddressInput, AddressSuggestion, CitySuggestion, StaffSuggestion, Store, StoreComparison, StoreInput, StoreStats
} from './store';
import { environment } from '../../../environments/environment';

@Service()
export class StoreService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    listStores(): Observable<Store[]> {
        return this.http.get<Store[]>(`${this.baseUrl}/stores`);
    }

    getStore(id: number): Observable<Store> {
        return this.http.get<Store>(`${this.baseUrl}/stores/${id}`);
    }

    getStoreStats(id: number): Observable<StoreStats> {
        return this.http.get<StoreStats>(`${this.baseUrl}/stores/${id}/stats`);
    }

    getStoreComparison(): Observable<StoreComparison[]> {
        return this.http.get<StoreComparison[]>(`${this.baseUrl}/stores/comparison`);
    }

    createStore(input: StoreInput): Observable<Store> {
        return this.http.post<Store>(`${this.baseUrl}/stores`, input);
    }

    updateStore(id: number, input: StoreInput): Observable<Store> {
        return this.http.put<Store>(`${this.baseUrl}/stores/${id}`, input);
    }

    deleteStore(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/stores/${id}`);
    }

    searchStaff(q: string): Observable<StaffSuggestion[]> {
        return this.http.get<StaffSuggestion[]>(`${this.baseUrl}/staff`, { params: { search: q } });
    }

    searchAddresses(q: string): Observable<AddressSuggestion[]> {
        return this.http.get<AddressSuggestion[]>(`${this.baseUrl}/addresses`, { params: { search: q } });
    }

    createAddress(input: AddressInput): Observable<{ address_id: number }> {
        return this.http.post<{ address_id: number }>(`${this.baseUrl}/addresses`, input);
    }

    searchCities(q: string): Observable<CitySuggestion[]> {
        return this.http.get<CitySuggestion[]>(`${this.baseUrl}/cities`, { params: { search: q } });
    }
}