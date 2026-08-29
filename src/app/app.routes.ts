import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./features/login/login-page').then(m => m.LoginPage) },
    {
        path: '',
        component: AdminLayout,
        canActivate: [authGuard],
        children: [
            { path: '', pathMatch: 'full', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
            { path: 'films', loadComponent: () => import('./features/films/films-page').then(m => m.FilmsPage) },
            { path: 'actors', loadComponent: () => import('./features/actors/actors-page').then(m => m.ActorsPage) },
            { path: 'customers', loadComponent: () => import('./features/customers/customers').then(m => m.Customers) }
        ]
    },
    { path: '**', redirectTo: '' }
];