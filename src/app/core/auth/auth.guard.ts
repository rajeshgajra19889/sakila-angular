import { inject } from '@angular/core';
import type { CanActivateFn, UrlTree } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
    const auth = inject(AuthService);
    if (auth.isAuthenticated()) return true;
    return inject(Router).createUrlTree(['/login']);
};