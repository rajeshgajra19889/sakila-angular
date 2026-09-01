import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from './store.service';
import { AddressSuggestion, CitySuggestion, StaffSuggestion, Store } from './store';
import { ToastService } from '../../core/toast/toast.service';

@Component({
    selector: 'app-stores-form-page',
    standalone: true,
    templateUrl: './stores-form-page.html',
    styleUrl: './stores-form-page.css',
})
export class StoresFormPage implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly storeService = inject(StoreService);
    private readonly toast = inject(ToastService);

    protected readonly mode = signal<'new' | 'edit'>('new');
    protected readonly storeId = signal<number | null>(null);
    protected readonly loadError = signal<string | null>(null);
    protected readonly saving = signal(false);

    protected readonly managerStaffId = signal<number | null>(null);
    protected readonly managerQuery = signal('');
    protected readonly managerSuggestions = signal<StaffSuggestion[]>([]);
    protected readonly pickedManager = signal<StaffSuggestion | null>(null);
    protected readonly managerMode = signal<'pick' | 'hire'>('pick');
    protected readonly newManagerFirst = signal('');
    protected readonly newManagerLast = signal('');
    protected readonly newManagerEmail = signal('');
    protected readonly active = signal(true);

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

    protected readonly managerWarning = computed(() => {
        const m = this.pickedManager();
        if (!m || m.manages_store_id === null) return null;
        if (this.mode() === 'edit' && m.manages_store_id === this.storeId()) return null;
        return `Already managing store ${m.manages_store_id} — that is blocked.`;
    });

    protected readonly addressComplete = computed(() => {
        if (this.addressMode() === 'select') return this.addressId() !== null;
        return this.newAddressLine().trim() !== ''
            && this.newPhone().trim() !== ''
            && this.newCityId() !== null;
    });

    protected readonly newManagerValid = computed(() =>
        this.newManagerFirst().trim() !== '' && this.newManagerLast().trim() !== '');

    protected readonly formValid = computed(() => {
        if (this.managerWarning() !== null) return false;
        if (this.managerMode() === 'hire') return this.newManagerValid() && this.addressComplete();
        return this.managerStaffId() !== null && this.addressComplete();
    });

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.mode.set('edit');
            this.storeId.set(Number(id));
            this.storeService.getStore(Number(id)).subscribe({
                next: s => this.loadEdit(s),
                error: err => this.loadError.set(err.error?.error ?? err.message)
            });
        }
    }

    private loadEdit(s: Store) {
        this.active.set(s.active);
        this.pickedManager.set({
            staff_id: s.manager.staff_id,
            first_name: s.manager.first_name,
            last_name: s.manager.last_name,
            email: s.manager.email,
            store_id: 0,
            active: true,
            manages_store_id: s.store_id
        });
        this.managerStaffId.set(s.manager.staff_id);
        this.managerQuery.set(`${s.manager.first_name} ${s.manager.last_name}`);
        this.addressMode.set('select');
        this.addressId.set(s.address.address_id);
        this.addressQuery.set(`${s.address.address}, ${s.address.city_name}`);
    }

    onManagerQuery(value: string) {
        this.managerQuery.set(value);
        const q = value.trim().toLowerCase();
        if (q === '') { this.managerSuggestions.set([]); return; }
        this.storeService.searchStaff(q).subscribe({
            next: rows => this.managerSuggestions.set(rows),
            error: () => this.managerSuggestions.set([])
        });
    }

    pickManager(s: StaffSuggestion) {
        this.pickedManager.set(s);
        this.managerStaffId.set(s.staff_id);
        this.managerQuery.set(`${s.first_name} ${s.last_name}`);
        this.managerSuggestions.set([]);
    }

    onAddressMode(value: string) {
        this.addressMode.set(value === 'new' ? 'new' : 'select');
        if (value === 'new') {
            this.newCitySuggestions.set([]);
        }
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
            address: this.newAddressLine(),
            address2: this.newAddress2() === '' ? null : this.newAddress2(),
            district: this.newDistrict(),
            city_id: this.newCityId()!,
            postal_code: this.newPostal() === '' ? null : this.newPostal(),
            phone: this.newPhone()
        }).subscribe({ next: res => callback(res.address_id) });
    }

    submit() {
        if (!this.formValid() || this.saving()) return;
        this.saving.set(true);
        this.resolveAddress(addressId => {
            const common = { address_id: addressId };
            if (this.mode() === 'new') {
                const payload = this.managerMode() === 'hire'
                    ? { ...common, new_manager_staff: {
                        first_name: this.newManagerFirst().trim(),
                        last_name: this.newManagerLast().trim(),
                        email: this.newManagerEmail().trim() === '' ? null : this.newManagerEmail().trim()
                    } }
                    : { ...common, manager_staff_id: this.managerStaffId()! };
                this.storeService.createStore(payload).subscribe({
                    next: s => {
                        this.toast.show(`Store ${s.store_id} created`, 'success');
                        this.router.navigateByUrl(`/stores/${s.store_id}`);
                    },
                    error: err => {
                        this.saving.set(false);
                        this.toast.show(err.error?.error ?? err.message, 'error');
                    }
                });
            } else {
                const id = this.storeId()!;
                this.storeService.updateStore(id, { ...common, manager_staff_id: this.managerStaffId()!, active: this.active() }).subscribe({
                    next: s => {
                        this.toast.show(`Store ${s.store_id} updated`, 'success');
                        this.router.navigateByUrl(`/stores/${s.store_id}`);
                    },
                    error: err => {
                        this.saving.set(false);
                        this.toast.show(err.error?.error ?? err.message, 'error');
                    }
                });
            }
        });
    }

    cancel() {
        this.router.navigateByUrl('/stores');
    }
}