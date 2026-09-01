import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StaffProfile {
    staff_id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string | null;
}

const TOKEN_KEY = 'sakila_token';

@Service()
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly baseUrl = environment.apiBaseUrl;

    private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
    readonly token = this._token.asReadonly();
    readonly staff = signal<StaffProfile | null>(null);
    readonly isAuthenticated = computed(() => this._token() !== null);
    readonly fullName = computed(() => {
        const s = this.staff();
        return s ? `${s.first_name} ${s.last_name}` : '';
    });

    login(username: string, password: string): Observable<{ token: string; staff: StaffProfile }> {
        return this.http.post<{ token: string; staff: StaffProfile }>(
            `${this.baseUrl}/auth/login`,
            { username, password }
        ).pipe(
            tap(res => {
                this._token.set(res.token);
                localStorage.setItem(TOKEN_KEY, res.token);
                this.staff.set(res.staff);
            })
        );
    }

    hydrate(): void {
        if (!this._token()) return;
        this.http.get<StaffProfile>(`${this.baseUrl}/auth/me`).subscribe({
            next: staff => this.staff.set(staff),
            error: () => this.logout()
        });
    }

    logout(): void {
        this._token.set(null);
        localStorage.removeItem(TOKEN_KEY);
        this.staff.set(null);
        this.router.navigateByUrl('/login');
    }
}