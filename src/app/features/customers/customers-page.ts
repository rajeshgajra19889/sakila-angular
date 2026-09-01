import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from '../stores/store.service';
import { AddressService } from '../addresses/address.service';
import { CustomerService } from './customer.service';

interface Store {
    store_id: number;
    address: { address: string; city_name: string };
    active: boolean;
}

interface Address {
    address_id: number;
    address: string;
    city_name: string;
}

@Component({
    selector: 'app-customer-page',
    standalone: true,
    imports: [],
    templateUrl: './customers-page.html',
    styleUrl: './customers-page.css'
})
export class CustomersPage implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private storeService = inject(StoreService);
    private addressService = inject(AddressService);
    private customerService = inject(CustomerService);

    protected readonly mode = signal<'add' | 'edit'>('add');

    protected readonly first_name = signal('');
    protected readonly last_name = signal('');
    protected readonly email = signal('');
    protected readonly first_nameTouched = signal(false);
    protected readonly last_nameTouched = signal(false);
    protected readonly emailTouched = signal(false);
    protected readonly selectedStoreId = signal<number | null>(null);
    protected readonly selectedAddressId = signal<number | null>(null);
    protected readonly activebool = signal(true);

    protected readonly stores = signal<Store[]>([]);
    protected readonly addresses = signal<Address[]>([]);
    protected readonly isSubmitting = signal(false);
    protected readonly successMessage = signal('');
    protected readonly errorMessage = signal('');

    protected readonly first_nameValid = computed(() => this.first_name().trim().length > 0);
    protected readonly last_nameValid = computed(() => this.last_name().trim().length > 0);
    protected readonly emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()));

    protected readonly storeDropdown = computed(() =>
        this.stores().filter(s => s.active)
    );

    ngOnInit(): void {
        this.storeService.listStores().subscribe({
            next: (res: any) => this.stores.set(res),
            error: () => { }
        });

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.mode.set('edit');
            this.customerService.getCustomer(Number(id)).subscribe({
                next: (c: any) => {
                    this.first_name.set(c.first_name);
                    this.last_name.set(c.last_name);
                    this.email.set(c.email ?? '');
                    this.selectedStoreId.set(c.store_id);
                    this.selectedAddressId.set(c.address_id ?? null);
                    this.activebool.set(c.activebool ?? true);
                    this.loadAddressOptions(c.address_id);
                },
                error: () => this.router.navigate(['/customers'])
            });
        } else {
            this.loadAddressOptions();
        }
    }

    private loadAddressOptions(preselect?: number) {
        this.addressService.searchAddresses({ pageSize: 20 }).subscribe({
            next: (res: Address[]) => {
                const list = res ?? [];
                this.addresses.set(list);
                if (preselect && !list.some(a => a.address_id === preselect)) {
                    this.addresses.set([{ address_id: preselect, address: `Address #${preselect}`, city_name: '' }, ...list]);
                }
            },
            error: () => { }
        });
    }

    protected onAddressQuery(q: string) {
        if (q.length < 2) return;
        this.addressService.searchAddresses({ search: q, pageSize: 20 }).subscribe({
            next: (res: any) => this.addresses.set(res ?? []),
            error: () => { }
        });
    }

    protected onSubmit() {
        this.first_nameTouched.set(true);
        this.last_nameTouched.set(true);
        this.emailTouched.set(true);

        if (!this.first_nameValid() || !this.last_nameValid() || !this.emailValid()) return;
        if (!this.selectedStoreId() || !this.selectedAddressId()) {
            this.errorMessage.set('Please select a store and an address');
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessage.set('');
        this.successMessage.set('');

        const id = this.mode() === 'edit' ? Number(this.route.snapshot.paramMap.get('id')) : null;
        const payload = {
            first_name: this.first_name().trim(),
            last_name: this.last_name().trim(),
            email: this.email().trim(),
            store_id: this.selectedStoreId()!,
            address_id: this.selectedAddressId()!,
            activebool: this.activebool()
        };

        const sub$ = id
            ? this.customerService.updateCustomer(id, payload)
            : this.customerService.createCustomer(payload);

        sub$.subscribe({
            next: () => {
                this.successMessage.set(id ? 'Customer updated' : 'Customer created');
                this.isSubmitting.set(false);
                setTimeout(() => this.router.navigate(['/customers']), 800);
            },
            error: (err) => {
                this.isSubmitting.set(false);
                this.errorMessage.set(err.error?.message ?? 'Save failed');
            }
        });
    }

    protected goBack() {
        this.router.navigate(['/customers']);
    }
}
