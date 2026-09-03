import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AddressService } from './address.service';
import { City } from './cities';
import { ToastService } from '../../core/toast/toast.service';

@Component({
    selector: 'app-cities-page',
    templateUrl: './cities-page.html',
    styleUrl: './cities-page.css',
})
export class CitiesPage implements OnInit {
    private readonly addrService = inject(AddressService);
    private readonly toast = inject(ToastService);
    private readonly router = inject(Router);

    protected readonly cities = signal<City[]>([]);
    protected readonly loading = signal(true);
    protected readonly search = signal('');
    protected readonly searching = signal(false);

    ngOnInit() { this.load(); }

    load() {
        this.loading.set(true);
        this.addrService.listCities(this.search() || undefined).subscribe({
            next: r => { this.cities.set(r); this.loading.set(false); this.searching.set(false); },
            error: () => { this.toast.show('Failed to load cities', 'error'); this.loading.set(false); this.searching.set(false); }
        });
    }

    onSearch(value: string) {
        this.search.set(value);
        this.searching.set(true);
        this.load();
    }

    add() { this.router.navigateByUrl('/cities/new'); }
    edit(id: number) { this.router.navigateByUrl(`/cities/${id}/edit`); }
    delete(id: number) {
        if (!window.confirm('Delete this city?')) return;
        this.addrService.deleteCity(id).subscribe({
            next: () => { this.toast.show('City deleted', 'success'); this.load(); },
            error: (err) => this.toast.show(err.error?.error ?? err.message, 'error')
        });
    }
}