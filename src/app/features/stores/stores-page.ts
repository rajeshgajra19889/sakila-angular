import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from './store.service';
import { Store } from './store';
import { ToastService } from '../../core/toast/toast.service';

@Component({
    selector: 'app-stores-page',
    standalone: true,
    templateUrl: './stores-page.html',
    styleUrl: './stores-page.css',
})
export class StoresPage implements OnInit {
    private readonly router = inject(Router);
    private readonly storeService = inject(StoreService);
    private readonly toast = inject(ToastService);

    protected readonly stores = signal<Store[]>([]);
    protected readonly filter = signal('');
    protected readonly status = signal<'all' | 'active' | 'inactive'>('all');
    protected readonly loading = signal(false);

    protected readonly filtered = computed(() => {
        let rows = this.stores();
        if (this.status() !== 'all') {
            rows = rows.filter(s => this.status() === 'active' ? s.active : !s.active);
        }
        if (rows.length === 0 && this.filter().trim() === '') return rows;
        const q = this.filter().trim().toLowerCase();
        if (q === '') return rows;
        return rows.filter(s =>
            s.manager.first_name.toLowerCase().includes(q)
            || s.manager.last_name.toLowerCase().includes(q)
            || s.address.address.toLowerCase().includes(q)
            || s.address.city_name.toLowerCase().includes(q));
    });

    ngOnInit() {
        this.load();
    }

    load() {
        this.loading.set(true);
        this.storeService.listStores().subscribe({
            next: rows => {
                this.stores.set(rows);
                this.loading.set(false);
            },
            error: err => {
                this.toast.show(err.error?.error ?? err.message, 'error');
                this.loading.set(false);
            }
        });
    }

    addStore() {
        this.router.navigateByUrl('/stores/new');
    }

    details(s: Store) {
        this.router.navigateByUrl(`/stores/${s.store_id}`);
    }

    edit(s: Store) {
        this.router.navigateByUrl(`/stores/${s.store_id}/edit`);
    }

    toggleActive(s: Store) {
        this.storeService.updateStore(s.store_id, { active: !s.active }).subscribe({
            next: updated => {
                this.toast.show(`Store ${s.store_id} ${updated.active ? 'activated' : 'deactivated'}`, 'success');
                this.load();
            },
            error: err => this.toast.show(err.error?.error ?? err.message, 'error')
        });
    }

    remove(s: Store) {
        if (!window.confirm(`Delete store ${s.store_id} (${s.address.address}, ${s.address.city_name})? Only stores with no inventory, staff or waitlist can be deleted.`)) return;
        this.storeService.deleteStore(s.store_id).subscribe({
            next: () => {
                this.toast.show(`Store ${s.store_id} deleted`, 'success');
                this.load();
            },
            error: err => this.toast.show(err.error?.error ?? err.message, 'error')
        });
    }
}