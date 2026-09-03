import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from './store.service';
import { StoreComparison } from './store';
import { ToastService } from '../../core/toast/toast.service';

export interface ComparisonTotals {
    stores: number;
    inventory: number;
    staff: number;
    revenue: number;
    rentals: number;
    customers: number;
}

@Component({
    selector: 'app-store-comparison',
    standalone: true,
    templateUrl: './store-comparison.html',
    styleUrl: './store-comparison.css',
})
export class StoreComparisonPage implements OnInit {
    private readonly storeService = inject(StoreService);
    private readonly toast = inject(ToastService);
    private readonly router = inject(Router);

    protected readonly rows = signal<StoreComparison[]>([]);
    protected readonly loading = signal(true);

    ngOnInit() {
        this.load();
    }

    load() {
        this.loading.set(true);
        this.storeService.getStoreComparison().subscribe({
            next: r => { this.rows.set(r); this.loading.set(false); },
            error: () => { this.toast.show('Failed to load comparison', 'error'); this.loading.set(false); }
        });
    }

    totals(): ComparisonTotals | null {
        const rows = this.rows();
        if (rows.length === 0) return null;
        return {
            stores: rows.length,
            inventory: rows.reduce((s, r) => s + r.inventoryCount, 0),
            staff: rows.reduce((s, r) => s + r.staffCount, 0),
            revenue: rows.reduce((s, r) => s + r.revenue, 0),
            rentals: rows.reduce((s, r) => s + r.totalRentals, 0),
            customers: rows.reduce((s, r) => s + r.customersServed, 0)
        };
    }

    maxRevenue(): number {
        return Math.max(1, ...this.rows().map(r => r.revenue));
    }

    openStore(id: number) { this.router.navigateByUrl(`/stores/${id}`); }
    back() { this.router.navigateByUrl('/stores'); }

    fmt(n: number): string { return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 2 }); }
}
