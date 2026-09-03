import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { City, CityInput, Country } from './cities';
import { Address } from './address';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AddressService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    searchAddresses(q: { search?: string; pageSize?: number }) {
        let params = new HttpParams();
        if (q.search) params = params.set('search', q.search);
        if (q.pageSize) params = params.set('pageSize', q.pageSize.toString());
        return this.http.get<any>(`${this.baseUrl}/addresses`, { params });
    }

    listAddresses(search?: string): Observable<Address[]> {
        let params = new HttpParams();
        if (search) params = params.set('search', search);
        return this.http.get<Address[]>(`${this.baseUrl}/addresses`, { params });
    }
    getAddress(id: number): Observable<Address> {
        return this.http.get<Address>(`${this.baseUrl}/addresses/${id}`);
    }
    createAddress(input: unknown): Observable<Address> {
        return this.http.post<Address>(`${this.baseUrl}/addresses`, input);
    }
    updateAddress(id: number, input: unknown): Observable<Address> {
        return this.http.put<Address>(`${this.baseUrl}/addresses/${id}`, input);
    }
    deleteAddress(id: number): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/addresses/${id}`);
    }

    listCities(search?: string): Observable<City[]> {
        let params = new HttpParams();
        if (search) params = params.set('search', search);
        return this.http.get<City[]>(`${this.baseUrl}/cities`, { params });
    }
    getCity(id: number): Observable<City> {
        return this.http.get<City>(`${this.baseUrl}/cities/${id}`);
    }
    createCity(input: CityInput): Observable<City> {
        return this.http.post<City>(`${this.baseUrl}/cities`, input);
    }
    updateCity(id: number, input: CityInput): Observable<City> {
        return this.http.put<City>(`${this.baseUrl}/cities/${id}`, input);
    }
    deleteCity(id: number): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/cities/${id}`);
    }

    listCountries(): Observable<Country[]> {
        return this.http.get<Country[]>(`${this.baseUrl}/countries`);
    }
}
