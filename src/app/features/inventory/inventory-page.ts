import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryService } from './inventory.service';
import { Inventory, InventoryDetail, InventoryQuery, Renter, StockSummaryRow } from './inventory';
import { ReservationService } from '../reservations/reservation.service';
import { NameSuggestion } from '../reservations/reservation';
import { CustomerService } from '../customers/customer.service';
import { ToastService } from '../../core/toast/toast.service';

@Component({
    selector: 'app-inventory-page',
    standalone: true,
    templateUrl: './inventory-page.html',
    styleUrl: './inventory-page.css',
})
export class InventoryPage implements OnInit {
    private readonly router = inject(Router);
    private readonly inventoryService = inject(InventoryService);
    private readonly reservationService = inject(ReservationService);
    private readonly customerService = inject(CustomerService);
    private readonly toast = inject(ToastService);

    protected readonly view = signal<'list' | 'stock'>('list');
    protected readonly items = signal<Inventory[]>([]);
    protected readonly total = signal(0);
    protected readonly page = signal(1);
    protected readonly pageSize = signal(10);
    protected readonly search = signal('');
    protected readonly sortBy = signal('inventory_id');
    protected readonly sortOrder = signal<'asc' | 'desc'>('asc');
    protected readonly loading = signal(false);

    protected readonly stock = signal<StockSummaryRow[]>([]);
    protected readonly stockLoading = signal(false);
    protected readonly stockPage = signal(1);
    protected readonly stockPageSize = signal(10);
    protected readonly stockSearch = signal('');
    protected readonly stockTotal = signal(0);

    protected readonly stockTotalPages = computed(() => Math.max(1, Math.ceil(this.stockTotal() / this.stockPageSize())));
    protected readonly stockPages = computed(() => {
        const current = this.stockPage();
        const last = this.stockTotalPages();
        const start = Math.max(1, Math.min(current - 2, last - 4));
        const end = Math.min(last, start + 4);
        const out: number[] = [];
        for (let i = start; i <= end; i++) out.push(i);
        return out;
    });

    protected readonly detailOpen = signal(false);
    protected readonly detailLoading = signal(false);
    protected readonly detailError = signal<string | null>(null);
    protected readonly detail = signal<InventoryDetail | null>(null);

    protected readonly holdersOpen = signal(false);
    protected readonly holdersLoading = signal(false);
    protected readonly holdersError = signal<string | null>(null);
    protected readonly holders = signal<Renter[]>([]);
    protected readonly holdersTitle = signal('');

    protected readonly holdOpen = signal(false);
    protected readonly holdSaving = signal(false);
    protected readonly holdError = signal<string | null>(null);
    protected readonly holdCopy = signal<Inventory | null>(null);
    protected readonly holdCustomerId = signal<number | null>(null);
    protected readonly holdCustomerQuery = signal('');
    protected readonly holdCustomerSuggestions = signal<NameSuggestion[]>([]);
    protected readonly holdDays = signal('3');
    protected readonly holdValid = computed(() => this.holdCopy() !== null && this.holdCustomerId() !== null);

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

    ngOnInit() { this.loadInventory(); }

    loadInventory() {
        this.loading.set(true);
        const query: InventoryQuery = {
            page: this.page(),
            pageSize: this.pageSize(),
            search: this.search(),
            sortBy: this.sortBy(),
            sortOrder: this.sortOrder()
        };
        this.inventoryService.listInventory(query).subscribe({
            next: result => {
                this.items.set(result.items);
                this.total.set(result.total);
                this.loading.set(false);
            },
            error: err => {
                this.toast.show(err.message, 'error');
                this.loading.set(false);
            }
        });
    }

    goToPage(p: number) {
        if (p < 1 || p > this.totalPages()) return;
        this.page.set(p);
        this.loadInventory();
    }

    onSearch(value: string) {
        this.search.set(value);
        this.page.set(1);
        this.loadInventory();
    }

    onPageSizeChange(size: string) {
        this.pageSize.set(Number(size));
        this.page.set(1);
        this.loadInventory();
    }

    onSort(column: string) {
        if (this.sortBy() === column) {
            this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortBy.set(column);
            this.sortOrder.set('asc');
        }
        this.loadInventory();
    }

    sortIndicator(column: string): string {
        if (this.sortBy() !== column) return '';
        return this.sortOrder() === 'asc' ? '▲' : '▼';
    }

    setView(v: 'list' | 'stock') {
        this.view.set(v);
        if (v === 'stock') this.loadSummary();
    }

    loadSummary() {
        this.stockLoading.set(true);
        this.inventoryService.getStockSummary({
            page: this.stockPage(),
            pageSize: this.stockPageSize(),
            search: this.stockSearch()
        }).subscribe({
            next: page => {
                this.stock.set(page.items);
                this.stockTotal.set(page.total);
                this.stockLoading.set(false);
            },
            error: err => {
                this.toast.show(err.message, 'error');
                this.stockLoading.set(false);
            }
        });
    }

    goStockPage(p: number) {
        if (p < 1 || p > this.stockTotalPages()) return;
        this.stockPage.set(p);
        this.loadSummary();
    }

    onStockSearch(value: string) {
        this.stockSearch.set(value);
        this.stockPage.set(1);
        this.loadSummary();
    }

    onStockPageSizeChange(size: string) {
        this.stockPageSize.set(Number(size));
        this.stockPage.set(1);
        this.loadSummary();
    }

    addStock() {
        this.router.navigateByUrl('/inventory/new');
    }

    editCopy(item: Inventory) {
        this.router.navigateByUrl(`/inventory/${item.inventory_id}/edit`);
    }

    openHolders(row: StockSummaryRow) {
        this.holders.set([]);
        this.holdersError.set(null);
        this.holdersOpen.set(true);
        this.holdersLoading.set(true);
        this.holdersTitle.set(`${row.title} — store ${row.store_id}`);
        this.inventoryService.getRenters(row.film_id, row.store_id).subscribe({
            next: rows => {
                this.holders.set(rows);
                this.holdersLoading.set(false);
            },
            error: err => {
                this.holdersError.set(err.error?.error ?? err.message);
                this.holdersLoading.set(false);
            }
        });
    }

    closeHolders() {
        this.holdersOpen.set(false);
    }

    openDetail(item: Inventory) {
        this.detail.set(null);
        this.detailError.set(null);
        this.detailOpen.set(true);
        this.detailLoading.set(true);
        this.inventoryService.getInventory(item.inventory_id).subscribe({
            next: d => {
                this.detail.set(d);
                this.detailLoading.set(false);
            },
            error: err => {
                this.detailError.set(err.error?.error ?? err.message);
                this.detailLoading.set(false);
            }
        });
    }

    closeDetail() {
        this.detailOpen.set(false);
        this.detail.set(null);
    }

    private expiresAtForDays(days: number): string {
        return new Date(Date.now() + days * 86_400_000).toISOString();
    }

    openHold(item: Inventory) {
        if (item.rented || item.held) return;
        this.holdCopy.set(item);
        this.holdCustomerId.set(null);
        this.holdCustomerQuery.set('');
        this.holdCustomerSuggestions.set([]);
        this.holdDays.set('3');
        this.holdError.set(null);
        this.holdOpen.set(true);
    }

    closeHold() {
        this.holdOpen.set(false);
        this.holdCopy.set(null);
    }

    onHoldCustomerQuery(value: string) {
        this.holdCustomerQuery.set(value);
        const q = value.trim().toLowerCase();
        if (q === '') { this.holdCustomerSuggestions.set([]); return; }
        this.customerService.listCustomers({ page: 1, pageSize: 6, search: q }).subscribe({
            next: page => this.holdCustomerSuggestions.set(page.items.map(c => ({ id: c.customer_id, label: `${c.first_name} ${c.last_name}` }))),
            error: () => this.holdCustomerSuggestions.set([])
        });
    }

    pickHoldCustomer(s: NameSuggestion) {
        this.holdCustomerId.set(s.id);
        this.holdCustomerQuery.set(s.label);
        this.holdCustomerSuggestions.set([]);
    }

    onHoldDaysChange(value: string) {
        this.holdDays.set(value);
    }

    confirmHold() {
        const copy = this.holdCopy();
        const customerId = this.holdCustomerId();
        if (!copy || customerId === null) return;
        this.holdSaving.set(true);
        this.holdError.set(null);
        this.reservationService.createHold({
            inventory_id: copy.inventory_id,
            customer_id: customerId,
            expires_at: this.expiresAtForDays(Number(this.holdDays()))
        }).subscribe({
            next: h => {
                this.holdSaving.set(false);
                this.holdOpen.set(false);
                this.holdCopy.set(null);
                this.toast.show(`Copy #${copy.inventory_id} held until ${h.expires_at.slice(0, 10)}`, 'success');
                if (this.view() === 'stock') {
                    this.loadSummary();
                } else {
                    this.loadInventory();
                }
            },
            error: err => {
                this.holdSaving.set(false);
                this.holdError.set(err.error?.error ?? err.message);
            }
        });
    }

    stopClick(event: Event) {
        event.stopPropagation();
    }
}