import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FilmService } from '../films/film.service';
import { Film, Language, FilmInput, FilmInventoryCopy } from '../films/film';
import { Category } from '../categories/category';
import { StoreService } from '../stores/store.service';
import { ToastService } from '../../core/toast/toast.service';
import { ConfirmService } from '../../core/confirm/confirm.service';

const RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17'] as const;
const SPECIAL_FEATURES = ['Trailers', 'Commentaries', 'Deleted Scenes', 'Behind the Scenes'] as const;

@Component({
    selector: 'app-film-form-page',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './film-form-page.html',
    styleUrl: './film-form-page.css',
})
export class FilmFormPage implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly filmService = inject(FilmService);
    private readonly storeService = inject(StoreService);
    private readonly toast = inject(ToastService);
    private readonly confirm = inject(ConfirmService);

    protected readonly mode = signal<'new' | 'edit'>('new');
    protected readonly filmId = signal<number | null>(null);
    protected readonly loadError = signal<string | null>(null);
    protected readonly saving = signal(false);

    protected readonly title = signal('');
    protected readonly description = signal('');
    protected readonly releaseYear = signal<number | null>(null);
    protected readonly languageId = signal<number | null>(null);
    protected readonly rentalDuration = signal<number | null>(3);
    protected readonly rentalRate = signal('');
    protected readonly length = signal<number | null>(null);
    protected readonly replacementCost = signal('');
    protected readonly rating = signal<string>('G');
    protected readonly specialFeatures = signal<string[]>([]);

    protected readonly languages = signal<Language[]>([]);
    protected readonly ratings = RATINGS;
    protected readonly specialFeaturesOptions = SPECIAL_FEATURES;

    protected readonly categories = signal<Category[]>([]);
    protected readonly selectedCategories = signal<number[]>([]);

    protected readonly inventory = signal<FilmInventoryCopy[]>([]);
    protected readonly stores = signal<{ store_id: number }[]>([]);
    protected readonly invStoreId = signal<number | null>(null);
    protected readonly invQty = signal(1);
    protected readonly invSaving = signal(false);
    protected readonly invLoading = signal(false);
    protected readonly invMessage = signal<string | null>(null);

    protected readonly titleError = computed(() => this.title().trim() === '');
    protected readonly languageError = computed(() => this.languageId() === null);
    protected readonly formValid = computed(() => !this.titleError() && !this.languageError());

    ngOnInit() {
        this.filmService.listCategories().subscribe({
            next: rows => this.categories.set(rows),
            error: () => this.toast.show('Failed to load categories', 'error')
        });
        this.filmService.getLanguages().subscribe({
            next: rows => {
                this.languages.set(rows);
                const id = this.route.snapshot.paramMap.get('id');
                if (id) {
                    this.mode.set('edit');
                    this.filmId.set(Number(id));
                    this.filmService.getFilm(Number(id)).subscribe({
                        next: f => this.loadEdit(f),
                        error: err => this.loadError.set(err.error?.error ?? err.message)
                    });
                    this.filmService.getFilmCategories(Number(id)).subscribe({
                        next: cats => this.selectedCategories.set(cats.map(c => c.category_id)),
                        error: () => this.toast.show('Failed to load categories', 'error')
                    });
                    this.loadInventory(Number(id));
                } else if (rows.length > 0) {
                    this.languageId.set(rows[0].language_id);
                }
            }
        });
    }

    private loadEdit(f: Film) {
        this.title.set(f.title);
        this.description.set(f.description ?? '');
        this.releaseYear.set(f.release_year);
        this.languageId.set(f.language_id);
        this.rentalDuration.set(f.rental_duration ?? 3);
        this.rentalRate.set(f.rental_rate ?? '');
        this.length.set(f.length);
        this.replacementCost.set(f.replacement_cost ?? '');
        this.rating.set(f.rating && (this.ratings as readonly string[]).includes(f.rating) ? f.rating : 'G');
        this.specialFeatures.set(f.special_features ? f.special_features.slice() : []);
    }

    onReleaseYearInput(value: string) {
        this.releaseYear.set(value === '' ? null : Number(value));
    }

    onRentalDurationInput(value: string) {
        this.rentalDuration.set(value === '' ? null : Number(value));
    }

    onLengthInput(value: string) {
        this.length.set(value === '' ? null : Number(value));
    }

    onLanguageChange(value: string) {
        this.languageId.set(value === '' ? null : Number(value));
    }

    toggleSpecialFeature(feature: string, checked: boolean) {
        if (checked) {
            if (!this.specialFeatures().includes(feature)) {
                this.specialFeatures.update(list => [...list, feature]);
            }
        } else {
            this.specialFeatures.update(list => list.filter(x => x !== feature));
        }
    }

    toggleCategory(id: number, checked: boolean) {
        if (checked) {
            if (!this.selectedCategories().includes(id)) {
                this.selectedCategories.update(list => [...list, id]);
            }
        } else {
            this.selectedCategories.update(list => list.filter(x => x !== id));
        }
    }

    submit() {
        if (!this.formValid() || this.saving()) return;
        this.saving.set(true);
        const input: FilmInput = {
            title: this.title().trim(),
            description: this.description().trim() === '' ? null : this.description().trim(),
            release_year: this.releaseYear(),
            language_id: this.languageId()!,
            rental_duration: this.rentalDuration(),
            rental_rate: this.rentalRate() === '' ? null : this.rentalRate(),
            length: this.length(),
            replacement_cost: this.replacementCost() === '' ? null : this.replacementCost(),
            rating: this.rating(),
            special_features: this.specialFeatures().length > 0 ? this.specialFeatures() : null
        };

        const action = this.mode() === 'edit'
            ? this.filmService.updateFilm(this.filmId()!, input)
            : this.filmService.createFilm(input);

        action.subscribe({
            next: (film) => {
                const id = this.mode() === 'edit' ? this.filmId()! : film.film_id;
                this.saveCategories(id, () => {
                    this.toast.show(this.mode() === 'edit' ? 'Film updated' : 'Film created', 'success');
                    this.router.navigateByUrl('/films');
                });
            },
            error: err => {
                this.saving.set(false);
                this.toast.show(err.error?.message ?? err.message, 'error');
            }
        });
    }

    private saveCategories(id: number, done: () => void) {
        const ids = this.selectedCategories();
        if (ids.length === 0) {
            this.filmService.setFilmCategories(id, []).subscribe({
                next: () => done(),
                error: () => { done(); }
            });
            return;
        }
        this.filmService.setFilmCategories(id, ids).subscribe({
            next: () => done(),
            error: err => {
                this.toast.show(err.error?.message ?? err.message, 'error');
                done();
            }
        });
    }

    private loadInventory(id: number) {
        this.invLoading.set(true);
        this.filmService.getFilmInventory(id).subscribe({
            next: copies => {
                this.inventory.set(copies);
                this.invLoading.set(false);
            },
            error: () => { this.invLoading.set(false); this.toast.show('Failed to load inventory', 'error'); }
        });
        if (this.stores().length === 0) {
            this.storeService.listStores().subscribe({
                next: list => {
                    this.stores.set(list);
                    if (list.length > 0 && this.invStoreId() === null) this.invStoreId.set(list[0].store_id);
                },
                error: () => this.toast.show('Failed to load stores', 'error')
            });
        }
    }

    protected inventoryByStore(): { store_id: number; total: number; available: number; rented: number }[] {
        const copies = this.inventory();
        const storeIds = new Set(copies.map(c => c.store_id));
        return [...storeIds].map(storeId => {
            const inStore = copies.filter(c => c.store_id === storeId);
            return {
                store_id: storeId,
                total: inStore.length,
                available: inStore.filter(c => !c.rented).length,
                rented: inStore.filter(c => c.rented).length
            };
        }).sort((a, b) => a.store_id - b.store_id);
    }

    protected onInvStoreChange(value: string) {
        this.invStoreId.set(value === '' ? null : Number(value));
    }

    protected onInvQtyInput(value: string) {
        const n = Number(value);
        this.invQty.set(Number.isInteger(n) && n >= 1 ? n : 1);
    }

    protected inventoryValid(): boolean {
        return this.invStoreId() !== null && this.invQty() >= 1 && this.invQty() <= 100 && !this.invSaving();
    }

    protected addCopies() {
        const id = this.filmId();
        const storeId = this.invStoreId();
        if (!id || storeId === null || !this.inventoryValid()) return;
        this.invSaving.set(true);
        this.invMessage.set(null);
        this.filmService.addFilmInventory(id, { store_id: storeId, qty: this.invQty() }).subscribe({
            next: r => {
                this.invSaving.set(false);
                this.toast.show(r.message ?? 'Copies added', 'success');
                this.invQty.set(1);
                this.loadInventory(id);
            },
            error: err => {
                this.invSaving.set(false);
                this.toast.show(err.error?.message ?? err.error?.error ?? 'Failed to add copies', 'error');
            }
        });
    }

    protected removeCopy(inventoryId: number, rented: boolean) {
        if (rented) {
            this.toast.show('Cannot remove a copy that is currently rented out', 'error');
            return;
        }
        const id = this.filmId();
        if (!id) return;
        this.confirm.confirm({
            title: 'Remove copy',
            message: 'Remove this copy from inventory?',
            confirmLabel: 'Remove',
            danger: true
        }).then(ok => {
            if (!ok) return;
            this.filmService.deleteInventoryCopy(inventoryId).subscribe({
                next: r => {
                    this.toast.show(r.message ?? 'Copy removed', 'success');
                    this.loadInventory(id);
                },
                error: err => this.toast.show(err.error?.message ?? err.error?.error ?? 'Failed to remove copy', 'error')
            });
        });
    }

    cancel() {
        this.router.navigateByUrl('/films');
    }
}
