import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout/admin-layout';

export const routes: Routes = [
    {
        path: '',
        component: AdminLayout,
        children: [
            { path: '', pathMatch: 'full', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
            { path: 'films', loadComponent: () => import('./features/films/films-page').then(m => m.FilmsPage) }
        ]
    }
];
