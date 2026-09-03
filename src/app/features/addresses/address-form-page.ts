import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressService } from './address.service';
import { City } from './cities';
import { Address } from './address';
import { ToastService } from '../../core/toast/toast.service';

@Component({
    selector: 'app-address-form-page',
    standalone: true,
    templateUrl: './address-form-page.html',
    styleUrl: './address-form-page.css',
})
export class AddressFormPage implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly addrService = inject(AddressService);
    private readonly toast = inject(ToastService);

    protected readonly mode = signal<'new' | 'edit'>('new');
    protected readonly addressId = signal<number | null>(null);
    protected readonly loadError = signal<string | null>(null);
    protected readonly saving = signal(false);

    protected readonly addressLine = signal('');
    protected readonly address2 = signal('');
    protected readonly district = signal('');
    protected readonly phone = signal('');
    protected readonly postalCode = signal('');

    protected readonly cityId = signal<number | null>(null);
    protected readonly cityQuery = signal('');
    protected readonly citySuggestions = signal<City[]>([]);

    protected readonly addressError = computed(() => this.addressLine().trim() === '');
    protected readonly districtError = computed(() => this.district().trim() === '');
    protected readonly phoneError = computed(() => this.phone().trim() === '');
    protected readonly cityError = computed(() => this.cityId() === null);
    protected readonly formValid = computed(() =>
        !this.addressError() && !this.districtError() && !this.phoneError() && !this.cityError()
    );

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.mode.set('edit');
            this.addressId.set(Number(id));
            this.addrService.getAddress(Number(id)).subscribe({
                next: a => this.prefill(a),
                error: () => {
                    this.loadError.set('Failed to load address.');
                    this.toast.show('Failed to load address', 'error');
                }
            });
        }
    }

    private prefill(a: Address) {
        this.addressLine.set(a.address);
        this.address2.set(a.address2 ?? '');
        this.district.set(a.district);
        this.phone.set(a.phone);
        this.postalCode.set(a.postal_code ?? '');
        this.cityId.set(a.city_id);
        this.cityQuery.set(`${a.city_name}, ${a.country_name}`);
    }

    onCityQuery(value: string) {
        this.cityQuery.set(value);
        const q = value.trim().toLowerCase();
        if (q === '') { this.citySuggestions.set([]); return; }
        this.addrService.searchCities(q).subscribe({
            next: rows => this.citySuggestions.set(rows),
            error: () => this.citySuggestions.set([])
        });
    }

    pickCity(c: City) {
        this.cityId.set(c.city_id);
        this.cityQuery.set(c.name + ', ' + c.country_name);
        this.citySuggestions.set([]);
    }

    submit() {
        if (!this.formValid() || this.saving()) return;
        this.saving.set(true);
        const input = {
            address: this.addressLine().trim(),
            address2: this.address2().trim() === '' ? null : this.address2().trim(),
            district: this.district().trim(),
            city_id: this.cityId()!,
            postal_code: this.postalCode().trim() === '' ? null : this.postalCode().trim(),
            phone: this.phone().trim()
        };
        const action = this.mode() === 'edit'
            ? this.addrService.updateAddress(this.addressId()!, input)
            : this.addrService.createAddress(input);
        action.subscribe({
            next: () => {
                this.toast.show(this.mode() === 'edit' ? 'Address updated' : 'Address created', 'success');
                this.router.navigateByUrl('/addresses');
            },
            error: err => { this.saving.set(false); this.toast.show(err.error?.error ?? err.message, 'error'); }
        });
    }

    cancel() { this.router.navigateByUrl('/addresses'); }
}