import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from './category';
import { environment } from '../../../environments/environment';

@Service()
export class CategoryService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    listCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.baseUrl}/categories`);
    }
    getCategory(id: number): Observable<Category> {
        return this.http.get<Category>(`${this.baseUrl}/categories/${id}`);
    }
    createCategory(input: { name: string }): Observable<{ success: boolean; data: Category }> {
        return this.http.post<{ success: boolean; data: Category }>(`${this.baseUrl}/categories`, input);
    }
    updateCategory(id: number, input: { name: string }): Observable<{ success: boolean; data: Category }> {
        return this.http.put<{ success: boolean; data: Category }>(`${this.baseUrl}/categories/${id}`, input);
    }
    deleteCategory(id: number): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/categories/${id}`);
    }
}