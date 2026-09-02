import { Component, inject, OnInit, signal } from '@angular/core';
import { RevenueService } from './revenue.service';
import { RevenueReport } from './revenue';
import { StoreService } from '../stores/store.service';
import { Store } from '../stores/store';
import { CustomerService } from '../customers/customer.service';
import { Customer } from '../customers/customers.interface';
import { ToastService } from '../../core/toast/toast.service';

@Component({
    selector: 'app-revenue-page',
    templateUrl: './revenue-page.html',
    styleUrl: './revenue-page.css',
})
export class RevenuePage implements OnInit {
    private readonly revenueService = inject(RevenueService);
    private readonly storeService = inject(StoreService);
    private readonly customerService = inject(CustomerService);
    private readonly toast = inject(ToastService);

    protected readonly report = signal<RevenueReport | null>(null);
    protected readonly loading = signal(true);

    protected readonly stores = signal<Store[]>([]);
    protected readonly storeId = signal<number | null>(null);
    protected readonly customers = signal<Customer[]>([]);
    protected readonly customerId = signal<number | null>(null);
    protected readonly dateFrom = signal('');
    protected readonly dateTo = signal('');

    ngOnInit(): void {
        this.storeService.listStores().subscribe({
            next: s => this.stores.set(s),
            error: () => this.toast.show('Failed to load stores', 'error')
        });
        this.customerService.listCustomers({ page: 1, pageSize: 500 }).subscribe({
            next: c => this.customers.set(c.items),
            error: () => this.toast.show('Failed to load customers', 'error')
        });
        this.loadReport();
    }

    loadReport() {
        this.loading.set(true);
        this.revenueService.getReport({
            storeId: this.storeId() ?? undefined,
            customerId: this.customerId() ?? undefined,
            dateFrom: this.dateFrom() || undefined,
            dateTo: this.dateTo() || undefined,
        }).subscribe({
            next: r => {
                this.report.set(r);
                this.loading.set(false);
            },
            error: (err) => {
                this.toast.show(err.message, 'error');
                this.loading.set(false);
            }
        });
    }

    onStoreChange(value: string) {
        this.storeId.set(value === '' || value === 'null' ? null : Number(value));
        this.loadReport();
    }
    onCustomerChange(value: string) {
        this.customerId.set(value === '' || value === 'null' ? null : Number(value));
        this.loadReport();
    }
    onDateFrom(value: string) {
        this.dateFrom.set(value);
        this.loadReport();
    }
    onDateTo(value: string) {
        this.dateTo.set(value);
        this.loadReport();
    }
    clearFilters() {
        this.storeId.set(null);
        this.customerId.set(null);
        this.dateFrom.set('');
        this.dateTo.set('');
        this.loadReport();
    }

    barPercent(total: number): number {
        const max = this.report()?.monthly.reduce((m, x) => Math.max(m, x.totalAmount), 1) ?? 1;
        return Math.round((total / max) * 100);
    }

    fmt(n: number): string {
        return '$' + n.toFixed(2);
    }
}