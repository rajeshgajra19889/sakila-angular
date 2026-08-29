
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-login-page',
    styleUrl: './login-page.css',
    templateUrl: './login-page.html',
    imports: [FormsModule],
})
export class LoginPage {
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);

    protected readonly username = signal('');
    protected readonly password = signal('');
    protected readonly error = signal<string | null>(null);
    protected readonly loading = signal(false);

    onSubmit(): void {
        const user = this.username().trim();
        if (!user || !this.password()) {
            this.error.set('Enter both username and password.');
            return;
        }
        this.loading.set(true);
        this.error.set(null);
        this.auth.login(user, this.password()).subscribe({
            next: () => {
                this.loading.set(false);
                this.router.navigateByUrl('/');
            },
            error: () => {
                this.loading.set(false);
                this.error.set('Invalid credentials. (Hint: Mike / Admin@123)');
            }
        });
    }
}