import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { InventoryService } from './inventory.service';
import { Inventory, InventoryDetail, InventoryQuery } from './inventory';
import { ToastService } from '../../core/toast/toast.service';

@Component({
    selector: 'app-inventory-page',
    standalone: true,
    templateUrl: './inventory-page.html',
    styleUrl: './inventory-page.css'
})
export class InventoryPage implements OnInit {
    private readonly inventoryService = inject(InventoryService);
    private readonly toast = inject(ToastService);

    protected readonly items = signal<Inventory[]>([]);
    protected readonly total = signal(0);
    protected readonly page = signal(1);
    protected readonly pageSize = signal(10);
    protected readonly search = signal('');
    protected readonly sortBy = signal('inventory_id');
    protected readonly sortOrder = signal<'asc' | 'desc'>('asc');
    protected readonly loading = signal(false);

    protected readonly detailOpen = signal(false);
    protected readonly detailLoading = signal(false);
    protected readonly detailError = signal<string | null>(null);
    protected readonly detail = signal<InventoryDetail | null>(null);

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
    stopClick(event: Event) {
        event.stopPropagation();
    }
}