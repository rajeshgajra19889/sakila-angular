import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressService } from './address.service';
import { Country } from './cities';
import { ToastService } from '../../core/toast/toast.service';

@Component({
    selector: 'app-city-form-page',
    standalone: true,
    templateUrl: './city-form-page.html',
    styleUrl: './city-form-page.css',
})
export class CityFormPage implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly addrService = inject(AddressService);
    private readonly toast = inject(ToastService);

    protected readonly mode = signal<'new' | 'edit'>('new');
    protected readonly cityId = signal<number | null>(null);
    protected readonly loadError = signal<string | null>(null);
    protected readonly saving = signal(false);

    protected readonly name = signal('');
    protected readonly countries = signal<Country[]>([]);
    protected readonly countryId = signal<number | null>(null);

    protected readonly nameError = computed(() => this.name().trim() === '');
    protected readonly countryError = computed(() => this.countryId() === null);
    protected readonly formValid = computed(() => !this.nameError() && !this.countryError());

    ngOnInit() {
        this.addrService.listCountries().subscribe({
            next: c => {
                this.countries.set(c);
                const id = this.route.snapshot.paramMap.get('id');
                if (id) {
                    this.mode.set('edit');
                    this.cityId.set(Number(id));
                    this.addrService.getCity(Number(id)).subscribe({
                        next: city => {
                            this.name.set(city.name);
                            this.countryId.set(city.country_id);
                        },
                        error: () => { this.loadError.set('Failed to load city.'); this.toast.show('Failed to load city', 'error'); }
                    });
                }
            },
            error: () => this.toast.show('Failed to load countries', 'error')
        });
    }

    onCountryChange(value: string) {
        this.countryId.set(value === '' || value === 'null' ? null : Number(value));
    }

    submit() {
        if (!this.formValid() || this.saving()) return;
        this.saving.set(true);
        const input = { name: this.name().trim(), country_id: this.countryId()! };
        const action = this.mode() === 'edit'
            ? this.addrService.updateCity(this.cityId()!, input)
            : this.addrService.createCity(input);
        action.subscribe({
            next: () => {
                this.toast.show(this.mode() === 'edit' ? 'City updated' : 'City created', 'success');
                this.router.navigateByUrl('/cities');
            },
            error: err => { this.saving.set(false); this.toast.show(err.error?.error ?? err.message, 'error'); }
        });
    }

    cancel() { this.router.navigateByUrl('/cities'); }
}