import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Stats { films: number; customers: number; rentals: number; inventory: number; }
export interface MonthRentals { month: string; count: number; }
export interface CategoryCount { name: string; count: number; }
export interface RecentRental { rental_id: number; rental_date: string; customer: string | null; film: string | null; }

@Service()
export class DashboardService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    getStats(): Observable<Stats> { return this.http.get<Stats>(`${this.baseUrl}/dashboard/stats`); }
    getRentalsPerMonth(): Observable<MonthRentals[]> { return this.http.get<MonthRentals[]>(`${this.baseUrl}/dashboard/rentals-per-month`); }
    getTopCategories(): Observable<CategoryCount[]> { return this.http.get<CategoryCount[]>(`${this.baseUrl}/dashboard/top-categories`); }
    getRecentRentals(): Observable<RecentRental[]> { return this.http.get<RecentRental[]>(`${this.baseUrl}/dashboard/recent-rentals`); }
}