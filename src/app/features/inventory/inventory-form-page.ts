import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from './inventory.service';
import { FilmService } from '../films/film.service';
import { StoreService } from '../stores/store.service';
import { ToastService } from '../../core/toast/toast.service';
import { InventoryDetail } from './inventory';
import { Store } from '../stores/store';

@Component({
    selector: 'app-inventory-form-page',
    standalone: true,
    templateUrl: './inventory-form-page.html',
    styleUrl: './inventory-form-page.css'
})
export class InventoryFormPage implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly inventoryService = inject(InventoryService);
    private readonly filmService = inject(FilmService);
    private readonly storeService = inject(StoreService);
    private readonly toast = inject(ToastService);

    protected readonly mode = signal<'new' | 'edit'>('new');
    protected readonly saving = signal(false);

    protected readonly stores = signal<Store[]>([]);

    protected readonly selectableStores = computed(() => {
        const current = this.copy()?.store_id;
        return this.stores().filter(s => s.active || s.store_id === current);
    });

    protected readonly stockFilmId = signal<number | null>(null);
    protected readonly stockQuery = signal('');
    protected readonly stockSuggestions = signal<{ film_id: number; title: string }[]>([]);
    protected readonly stockStore = signal<number | null>(null);
    protected readonly stockQty = signal('1');

    protected readonly copy = signal<InventoryDetail | null>(null);
    protected readonly loadError = signal<string | null>(null);

    protected readonly stockValid = computed(() => {
        if (this.stockStore() === null) return false;
        if (this.mode() === 'edit') return this.copy() !== null;
        return this.stockFilmId() !== null && this.stockQty() !== '' && Number(this.stockQty()) >= 1;
    });

    ngOnInit() {
        this.storeService.listStores().subscribe({
            next: rows => {
                this.stores.set(rows);
                if (rows.length && this.copy() === null) this.stockStore.set(rows[0].store_id);
            },
            error: err => this.toast.show(err.message, 'error')
        });

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.mode.set('edit');
            this.inventoryService.getInventory(Number(id)).subscribe({
                next: d => {
                    this.copy.set(d);
                    this.stockStore.set(d.store_id);
                },
                error: err => this.loadError.set(err.error?.error ?? err.message)
            });
        }
    }

    onStockQuery(value: string) {
        this.stockQuery.set(value);
        const q = value.trim().toLowerCase();
        if (q === '') { this.stockSuggestions.set([]); return; }
        this.filmService.listFilms({ page: 1, pageSize: 6, search: q }).subscribe({
            next: page => this.stockSuggestions.set(page.items),
            error: () => this.stockSuggestions.set([])
        });
    }

    onStoreChange(value: string) {
        this.stockStore.set(Number(value));
    }

    pickStockFilm(film: { film_id: number; title: string }) {
        this.stockFilmId.set(film.film_id);
        this.stockQuery.set(film.title);
        this.stockSuggestions.set([]);
    }

    submit() {
        if (!this.stockValid()) return;
        this.saving.set(true);
        if (this.mode() === 'new') {
            this.inventoryService.createStock({
                film_id: this.stockFilmId()!,
                store_id: this.stockStore()!,
                qty: Number(this.stockQty())
            }).subscribe({
                next: res => {
                    this.toast.show(`Added ${res.created} copy/copies`, 'success');
                    this.router.navigateByUrl('/inventory');
                },
                error: err => {
                    this.saving.set(false);
                    this.toast.show(err.error?.error ?? err.message, 'error');
                }
            });
        } else {
            const c = this.copy();
            if (!c) return;
            this.inventoryService.moveCopy(c.inventory_id, this.stockStore()!).subscribe({
                next: moved => {
                    this.toast.show(`Copy moved to store ${moved.store_id}`, 'success');
                    this.router.navigateByUrl('/inventory');
                },
                error: err => {
                    this.saving.set(false);
                    this.toast.show(err.error?.error ?? err.message, 'error');
                }
            });
        }
    }

    cancel() {
        this.router.navigateByUrl('/inventory');
    }
}