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
            { path: 'films/new', loadComponent: () => import('./features/films/film-form-page').then(m => m.FilmFormPage) },
            { path: 'films/:id/edit', loadComponent: () => import('./features/films/film-form-page').then(m => m.FilmFormPage) },
            { path: 'actors', loadComponent: () => import('./features/actors/actors-page').then(m => m.ActorsPage) },
            { path: 'customers', loadComponent: () => import('./features/customers/customers').then(m => m.Customers) },
            { path: 'customers/new', loadComponent: () => import('./features/customers/customers-page').then(m => m.CustomersPage) },
            { path: 'customers/:id/edit', loadComponent: () => import('./features/customers/customers-page').then(m => m.CustomersPage) },
            { path: 'rentals', loadComponent: () => import('./features/rentals/rentals-page').then(m => m.RentalsPage) },
            { path: 'inventory', loadComponent: () => import('./features/inventory/inventory-page').then(m => m.InventoryPage) },
            { path: 'inventory/new', loadComponent: () => import('./features/inventory/inventory-form-page').then(m => m.InventoryFormPage) },
            { path: 'inventory/:id/edit', loadComponent: () => import('./features/inventory/inventory-form-page').then(m => m.InventoryFormPage) },
            { path: 'reservations', loadComponent: () => import('./features/reservations/reservation-page').then(m => m.ReservationPage) },
            { path: 'revenue', loadComponent: () => import('./features/revenue/revenue-page').then(m => m.RevenuePage) },
            { path: 'stores', loadComponent: () => import('./features/stores/stores-page').then(m => m.StoresPage) },
            { path: 'stores/new', loadComponent: () => import('./features/stores/stores-form-page').then(m => m.StoresFormPage) },
            { path: 'stores/:id', loadComponent: () => import('./features/stores/store-stats-page').then(m => m.StoreStatsPage) },
            { path: 'stores/:id/edit', loadComponent: () => import('./features/stores/stores-form-page').then(m => m.StoresFormPage) },
            { path: 'payments', loadComponent: () => import('./features/payments/payments-page').then(m => m.PaymentsPage) },
            { path: 'payments/new', loadComponent: () => import('./features/payments/payment-form-page').then(m => m.PaymentFormPage) },
            { path: 'payments/:id/edit', loadComponent: () => import('./features/payments/payment-form-page').then(m => m.PaymentFormPage) },
            { path: 'staffs', loadComponent: () => import('./features/staffs/staff-list').then(m => m.StaffList) },
            { path: 'staffs/new', loadComponent: () => import('./features/staffs/staff-page').then(m => m.StaffPage) },
            { path: 'staffs/:id/edit', loadComponent: () => import('./features/staffs/staff-page').then(m => m.StaffPage) },
            { path: 'languages', loadComponent: () => import('./features/languages/languages-page').then(m => m.LanguagesPage) },
            { path: 'languages/new', loadComponent: () => import('./features/languages/language-form-page').then(m => m.LanguageFormPage) },
            { path: 'languages/:id/edit', loadComponent: () => import('./features/languages/language-form-page').then(m => m.LanguageFormPage) },
            { path: 'categories', loadComponent: () => import('./features/categories/categories-page').then(m => m.CategoriesPage) },
            { path: 'categories/new', loadComponent: () => import('./features/categories/category-form-page').then(m => m.CategoryFormPage) },
            { path: 'categories/:id/edit', loadComponent: () => import('./features/categories/category-form-page').then(m => m.CategoryFormPage) },
            { path: 'cities', loadComponent: () => import('./features/addresses/cities-page').then(m => m.CitiesPage) },
            { path: 'cities/new', loadComponent: () => import('./features/addresses/city-form-page').then(m => m.CityFormPage) },
            { path: 'cities/:id/edit', loadComponent: () => import('./features/addresses/city-form-page').then(m => m.CityFormPage) },
            { path: 'addresses', loadComponent: () => import('./features/addresses/addresses-page').then(m => m.AddressesPage) },
            { path: 'addresses/new', loadComponent: () => import('./features/addresses/address-form-page').then(m => m.AddressFormPage) },
            { path: 'addresses/:id/edit', loadComponent: () => import('./features/addresses/address-form-page').then(m => m.AddressFormPage) },
        ]
    },
    { path: '**', redirectTo: '' }
];