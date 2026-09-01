import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from '../stores/store.service';
import { AddressSuggestion, CitySuggestion, Store } from '../stores/store';
import { StaffService } from './staff.service';
import { StaffDetail, StaffInput } from './staff';
import { ToastService } from '../../core/toast/toast.service';

@Component({
    selector: 'app-staff-page',
    standalone: true,
    templateUrl: './staff-page.html',
    styleUrl: './staff-page.css',
})
export class StaffPage implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly storeService = inject(StoreService);
    private readonly staffService = inject(StaffService);
    private readonly toast = inject(ToastService);

    protected readonly mode = signal<'new' | 'edit'>('new');
    protected readonly staffId = signal<number | null>(null);
    protected readonly loadError = signal<string | null>(null);
    protected readonly saving = signal(false);

    protected readonly first_name = signal('');
    protected readonly last_name = signal('');
    protected readonly email = signal('');
    protected readonly username = signal('');
    protected readonly password = signal('');
    protected readonly active = signal(true);

    protected readonly stores = signal<Store[]>([]);
    protected readonly storeId = signal<number | null>(null);

    protected readonly addressMode = signal<'select' | 'new'>('select');
    protected readonly addressId = signal<number | null>(null);
    protected readonly addressQuery = signal('');
    protected readonly addressSuggestions = signal<AddressSuggestion[]>([]);

    protected readonly newAddressLine = signal('');
    protected readonly newAddress2 = signal('');
    protected readonly newDistrict = signal('');
    protected readonly newPostal = signal('');
    protected readonly newPhone = signal('');
    protected readonly newCityId = signal<number | null>(null);
    protected readonly newCityQuery = signal('');
    protected readonly newCitySuggestions = signal<CitySuggestion[]>([]);

    protected readonly firstNameError = computed(() => this.first_name().trim() === '');
    protected readonly lastNameError = computed(() => this.last_name().trim() === '');
    protected readonly usernameError = computed(() => this.username().trim() === '');
    protected readonly passwordError = computed(() =>
        this.mode() === 'edit' ? false : this.password().trim() === ''
    );
    protected readonly storeError = computed(() => this.storeId() === null);

    protected readonly addressComplete = computed(() => {
        if (this.addressMode() === 'select') return this.addressId() !== null;
        return this.newAddressLine().trim() !== ''
            && this.newPhone().trim() !== ''
            && this.newCityId() !== null;
    });

    protected readonly formValid = computed(() =>
        !this.firstNameError()
        && !this.lastNameError()
        && !this.usernameError()
        && !this.passwordError()
        && !this.storeError()
        && this.addressComplete()
    );

    ngOnInit() {
        this.storeService.listStores().subscribe({
            next: s => this.stores.set(s),
            error: () => this.toast.show('Failed to load stores', 'error')
        });

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.mode.set('edit');
            this.staffId.set(Number(id));
            this.staffService.getStaff(Number(id)).subscribe({
                next: s => this.prefill(s),
                error: () => {
                    this.loadError.set('Failed to load staff.');
                    this.toast.show('Failed to load staff', 'error');
                }
            });
        }
    }

    private prefill(s: StaffDetail) {
        this.first_name.set(s.first_name);
        this.last_name.set(s.last_name);
        this.email.set(s.email ?? '');
        this.username.set(s.username);
        this.active.set(s.active);
        this.storeId.set(s.store_id);
        if (s.address_id) {
            this.addressMode.set('select');
            this.addressId.set(s.address_id);
            const a = s.address;
            this.addressQuery.set(a ? `${a.address}, ${a.district?.trim() || a.city_name}` : `Address #${s.address_id}`);
        }
    }

    onStoreChange(value: string) {
        this.storeId.set(value === '' || value === 'null' ? null : Number(value));
    }

    onAddressMode(value: string) {
        this.addressMode.set(value === 'new' ? 'new' : 'select');
        if (value === 'new') this.newCitySuggestions.set([]);
    }

    onAddressQuery(value: string) {
        this.addressQuery.set(value);
        const q = value.trim().toLowerCase();
        if (q === '') { this.addressSuggestions.set([]); return; }
        this.storeService.searchAddresses(q).subscribe({
            next: rows => this.addressSuggestions.set(rows),
            error: () => this.addressSuggestions.set([])
        });
    }

    pickAddress(a: AddressSuggestion) {
        this.addressId.set(a.address_id);
        this.addressQuery.set(`${a.address}, ${a.city_name} — ${a.district}`);
        this.addressSuggestions.set([]);
    }

    onCityQuery(value: string) {
        this.newCityQuery.set(value);
        const q = value.trim().toLowerCase();
        if (q === '') { this.newCitySuggestions.set([]); return; }
        this.storeService.searchCities(q).subscribe({
            next: rows => this.newCitySuggestions.set(rows),
            error: () => this.newCitySuggestions.set([])
        });
    }

    pickCity(c: CitySuggestion) {
        this.newCityId.set(c.city_id);
        this.newCityQuery.set(`${c.name}, ${c.country_name}`);
        this.newCitySuggestions.set([]);
    }

    private resolveAddress(callback: (addressId: number) => void) {
        if (this.addressMode() === 'select') {
            callback(this.addressId()!);
            return;
        }
        this.storeService.createAddress({
            address: this.newAddressLine().trim(),
            address2: this.newAddress2().trim() === '' ? null : this.newAddress2().trim(),
            district: this.newDistrict().trim(),
            city_id: this.newCityId()!,
            postal_code: this.newPostal().trim() === '' ? null : this.newPostal().trim(),
            phone: this.newPhone().trim()
        }).subscribe({
            next: res => callback(res.address_id),
            error: err => {
                this.saving.set(false);
                this.toast.show(err.error?.error ?? err.message, 'error');
            }
        });
    }

    submit() {
        if (!this.formValid() || this.saving()) return;
        this.saving.set(true);

        const payload: Record<string, unknown> = {
            first_name: this.first_name().trim(),
            last_name: this.last_name().trim(),
            email: this.email().trim() === '' ? null : this.email().trim(),
            username: this.username().trim(),
            store_id: this.storeId()!,
            active: this.active()
        };
        if (this.mode() === 'new' || this.password().trim() !== '') {
            payload['password'] = this.password().trim();
        }

        this.resolveAddress(addressId => {
            const input = { ...payload, address_id: addressId } as StaffInput;
            const action = this.mode() === 'edit'
                ? this.staffService.updateStaff(this.staffId()!, input)
                : this.staffService.createStaff(input);

            action.subscribe({
                next: () => {
                    this.toast.show(this.mode() === 'edit' ? 'Staff updated' : 'Staff created', 'success');
                    this.router.navigateByUrl('/staffs');
                },
                error: err => {
                    this.saving.set(false);
                    this.toast.show(err.error?.error ?? err.message, 'error');
                }
            });
        });
    }

    cancel() {
        this.router.navigateByUrl('/staffs');
    }
}
