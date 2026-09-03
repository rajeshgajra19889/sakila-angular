import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Language } from './language';
import { environment } from '../../../environments/environment';

@Service()
export class LanguageService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    listLanguages(): Observable<Language[]> {
        return this.http.get<Language[]>(`${this.baseUrl}/languages`);
    }
    getLanguage(id: number): Observable<Language> {
        return this.http.get<Language>(`${this.baseUrl}/languages/${id}`);
    }
    createLanguage(input: { name: string }): Observable<{ success: boolean; data: Language }> {
        return this.http.post<{ success: boolean; data: Language }>(`${this.baseUrl}/languages`, input);
    }
    updateLanguage(id: number, input: { name: string }): Observable<{ success: boolean; data: Language }> {
        return this.http.put<{ success: boolean; data: Language }>(`${this.baseUrl}/languages/${id}`, input);
    }
    deleteLanguage(id: number): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/languages/${id}`);
    }
}