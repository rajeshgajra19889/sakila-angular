import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AddressService } from './address.service';
import { Address } from './address';
import { ToastService } from '../../core/toast/toast.service';

@Component({
    selector: 'app-addresses-page',
    templateUrl: './addresses-page.html',
    styleUrl: './addresses-page.css',
})
export class AddressesPage implements OnInit {
    private readonly addrService = inject(AddressService);
    private readonly toast = inject(ToastService);
    private readonly router = inject(Router);

    protected readonly addresses = signal<Address[]>([]);
    protected readonly loading = signal(true);
    protected readonly search = signal('');
    protected readonly total = signal(0);
    protected readonly page = signal(1);
    protected readonly pageSize = 20;
    protected readonly pageCount = computed(() => this.total() === 0 ? 0 : Math.ceil(this.total() / this.pageSize));

    ngOnInit() { this.load(); }

    load() {
        this.loading.set(true);
        this.addrService.listAddresses({ search: this.search() || undefined, page: this.page(), pageSize: this.pageSize }).subscribe({
            next: r => { this.addresses.set(r.items); this.total.set(r.total); this.loading.set(false); },
            error: () => { this.toast.show('Failed to load addresses', 'error'); this.loading.set(false); }
        });
    }

    onSearch(value: string) {
        this.search.set(value);
        this.page.set(1);
        this.load();
    }

    prev() { if (this.page() > 1) { this.page.update(p => p - 1); this.load(); } }
    next() { if (this.page() < this.pageCount()) { this.page.update(p => p + 1); this.load(); } }

    add() { this.router.navigateByUrl('/addresses/new'); }
    edit(id: number) { this.router.navigateByUrl(`/addresses/${id}/edit`); }
    delete(id: number) {
        if (!window.confirm('Delete this address?')) return;
        this.addrService.deleteAddress(id).subscribe({
            next: () => { this.toast.show('Address deleted', 'success'); this.load(); },
            error: (err) => this.toast.show(err.error?.error ?? err.message, 'error')
        });
    }
}