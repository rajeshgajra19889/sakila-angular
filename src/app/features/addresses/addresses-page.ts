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
    protected readonly pageSize = signal(20);
    protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
    protected readonly pages = computed(() => {
        const current = this.page();
        const last = this.totalPages();
        const start = Math.max(1, Math.min(current - 2, last - 4));
        const end = Math.min(last, start + 4);
        const out: number[] = [];
        for (let i = start; i <= end; i++) out.push(i);
        return out;
    });

    ngOnInit() { this.load(); }

    load() {
        this.loading.set(true);
        this.addrService.listAddresses({ search: this.search() || undefined, page: this.page(), pageSize: this.pageSize() }).subscribe({
            next: r => { this.addresses.set(r.items); this.total.set(r.total); this.loading.set(false); },
            error: () => { this.toast.show('Failed to load addresses', 'error'); this.loading.set(false); }
        });
    }

    goToPage(p: number) {
        if (p < 1 || p > this.totalPages()) return;
        this.page.set(p);
        this.load();
    }

    onSearch(value: string) {
        this.search.set(value);
        this.page.set(1);
        this.load();
    }

    onPageSizeChange(size: string) {
        this.pageSize.set(Number(size));
        this.page.set(1);
        this.load();
    }

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