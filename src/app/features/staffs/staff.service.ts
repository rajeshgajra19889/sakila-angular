import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Staff, StaffPage, StaffQuery, StaffInput, StaffDetail, StaffPerformance } from './staff';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Service()
export class StaffService {
   private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    listStaff(query: StaffQuery): Observable<StaffPage> {
        let params = new HttpParams().set('page', query.page).set('pageSize', query.pageSize);
        if (query.search) params = params.set('search', query.search);
        if (query.sortBy) params = params.set('sortBy', query.sortBy);
        if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
        return this.http.get<StaffPage>(`${this.baseUrl}/staff`, { params });
    }

    getStaff(id: number): Observable<StaffDetail> {
        return this.http.get<StaffDetail>(`${this.baseUrl}/staff/${id}`);
    }

    createStaff(input: StaffInput): Observable<Staff> {
        return this.http.post<Staff>(`${this.baseUrl}/staff`, input);
    }

    updateStaff(id: number, input: StaffInput): Observable<Staff> {
        return this.http.put<Staff>(`${this.baseUrl}/staff/${id}`, input);
    }

    deleteStaff(id: number): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/staff/${id}`);
    }

    getPerformance(): Observable<StaffPerformance[]> {
        return this.http.get<StaffPerformance[]>(`${this.baseUrl}/staff/performance`);
    }

}
