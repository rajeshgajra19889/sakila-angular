import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Inventory } from '../inventory/inventory';
import { InventoryService } from '../inventory/inventory.service';
import { CustomerService } from '../customers/customer.service';
import { FilmService } from '../films/film.service';
import { StoreService } from '../stores/store.service';
import { ReservationService } from './reservation.service';
import { Hold, NameSuggestion, WaitlistEntry } from './reservation';
import { Store } from '../stores/store';
import { ToastService } from '../../core/toast/toast.service';

@Component({
    selector: 'app-reservation-page',
    standalone: true,
    templateUrl: './reservation-page.html',
    styleUrl: './reservation-page.css'
})
export class ReservationPage implements OnInit {
    private readonly router = inject(Router);
    private readonly reservationService = inject(ReservationService);
    private readonly inventoryService = inject(InventoryService);
    private readonly customerService = inject(CustomerService);
    private readonly filmService = inject(FilmService);
    private readonly storeService = inject(StoreService);
    private readonly toast = inject(ToastService);

    protected readonly view = signal<'holds' | 'waitlist'>('holds');

    protected readonly holds = signal<Hold[]>([]);
    protected readonly holdsTotal = signal(0);
    protected readonly holdsPage = signal(1);
    protected readonly holdsPageSize = signal(10);
    protected readonly holdsSearch = signal('');
    protected readonly holdsLoading = signal(false);
    protected readonly holdsTotalPages = computed(() => Math.max(1, Math.ceil(this.holdsTotal() / this.holdsPageSize())));
    protected readonly holdsPages = computed(() => pageWindow(this.holdsPage(), this.holdsTotalPages()));

    protected readonly waitlist = signal<WaitlistEntry[]>([]);
    protected readonly wlTotal = signal(0);
    protected readonly wlPage = signal(1);
    protected readonly wlPageSize = signal(10);
    protected readonly wlSearch = signal('');
    protected readonly wlLoading = signal(false);
    protected readonly wlTotalPages = computed(() => Math.max(1, Math.ceil(this.wlTotal() / this.wlPageSize())));
    protected readonly wlPages = computed(() => pageWindow(this.wlPage(), this.wlTotalPages()));

    protected readonly stores = signal<Store[]>([]);

    protected readonly activeStores = computed(() => this.stores().filter(s => s.active));

    protected readonly wlCustomerId = signal<number | null>(null);
    protected readonly wlCustomerQuery = signal('');
    protected readonly wlCustomerSuggestions = signal<NameSuggestion[]>([]);
    protected readonly wlFilmId = signal<number | null>(null);
    protected readonly wlFilmQuery = signal('');
    protected readonly wlFilmSuggestions = signal<{ film_id: number; title: string }[]>([]);
    protected readonly wlStore = signal<number | null>(null);
    protected readonly wlSaving = signal(false);
    protected readonly wlValid = computed(() => this.wlCustomerId() !== null && this.wlFilmId() !== null);

    protected readonly promoteOpen = signal(false);
    protected readonly promoteSaving = signal(false);
    protected readonly promoteError = signal<string | null>(null);
    protected readonly promoteEntry = signal<WaitlistEntry | null>(null);
    protected readonly promoteCopies = signal<Inventory[]>([]);
    protected readonly promoteLoading = signal(false);
    protected readonly promoteDays = signal('3');

    ngOnInit() {
        this.storeService.listStores().subscribe({
            next: rows => this.stores.set(rows),
            error: err => this.toast.show(err.message, 'error')
        });
        this.loadHolds();
        this.loadWaitlist();
    }

    setView(v: 'holds' | 'waitlist') {
        this.view.set(v);
    }

    loadHolds() {
        this.holdsLoading.set(true);
        this.reservationService.listHolds({
            page: this.holdsPage(),
            pageSize: this.holdsPageSize(),
            search: this.holdsSearch()
        }).subscribe({
            next: page => {
                this.holds.set(page.items);
                this.holdsTotal.set(page.total);
                this.holdsLoading.set(false);
            },
            error: err => {
                this.toast.show(err.message, 'error');
                this.holdsLoading.set(false);
            }
        });
    }

    goHoldsPage(p: number) {
        if (p < 1 || p > this.holdsTotalPages()) return;
        this.holdsPage.set(p);
        this.loadHolds();
    }

    onHoldsSearch(value: string) {
        this.holdsSearch.set(value);
        this.holdsPage.set(1);
        this.loadHolds();
    }

    onHoldsPageSizeChange(size: string) {
        this.holdsPageSize.set(Number(size));
        this.holdsPage.set(1);
        this.loadHolds();
    }

    release(hold: Hold) {
        this.reservationService.releaseHold(hold.hold_id).subscribe({
            next: () => {
                this.toast.show(`Hold released for ${hold.customer_name}`, 'success');
                this.loadHolds();
                this.holdsPage.set(1);
            },
            error: err => this.toast.show(err.error?.error ?? err.message, 'error')
        });
    }

    loadWaitlist() {
        this.wlLoading.set(true);
        this.reservationService.listWaitlist({
            page: this.wlPage(),
            pageSize: this.wlPageSize(),
            search: this.wlSearch()
        }).subscribe({
            next: page => {
                this.waitlist.set(page.items);
                this.wlTotal.set(page.total);
                this.wlLoading.set(false);
            },
            error: err => {
                this.toast.show(err.message, 'error');
                this.wlLoading.set(false);
            }
        });
    }

    goWaitlistPage(p: number) {
        if (p < 1 || p > this.wlTotalPages()) return;
        this.wlPage.set(p);
        this.loadWaitlist();
    }

    onWaitlistSearch(value: string) {
        this.wlSearch.set(value);
        this.wlPage.set(1);
        this.loadWaitlist();
    }

    onWaitlistPageSizeChange(size: string) {
        this.wlPageSize.set(Number(size));
        this.wlPage.set(1);
        this.loadWaitlist();
    }

    onWlCustomerQuery(value: string) {
        this.wlCustomerQuery.set(value);
        const q = value.trim().toLowerCase();
        if (q === '') { this.wlCustomerSuggestions.set([]); return; }
        this.customerService.listCustomers({ page: 1, pageSize: 6, search: q }).subscribe({
            next: page => this.wlCustomerSuggestions.set(page.items.map(c => ({ id: c.customer_id, label: `${c.first_name} ${c.last_name}` }))),
            error: () => this.wlCustomerSuggestions.set([])
        });
    }

    pickWlCustomer(s: NameSuggestion) {
        this.wlCustomerId.set(s.id);
        this.wlCustomerQuery.set(s.label);
        this.wlCustomerSuggestions.set([]);
    }

    onWlFilmQuery(value: string) {
        this.wlFilmQuery.set(value);
        const q = value.trim().toLowerCase();
        if (q === '') { this.wlFilmSuggestions.set([]); return; }
        this.filmService.listFilms({ page: 1, pageSize: 6, search: q }).subscribe({
            next: page => this.wlFilmSuggestions.set(page.items),
            error: () => this.wlFilmSuggestions.set([])
        });
    }

    pickWlFilm(film: { film_id: number; title: string }) {
        this.wlFilmId.set(film.film_id);
        this.wlFilmQuery.set(film.title);
        this.wlFilmSuggestions.set([]);
    }

    onWlStoreChange(value: string) {
        this.wlStore.set(value === '' ? null : Number(value));
    }

    addWaitlist() {
        if (!this.wlValid()) return;
        this.wlSaving.set(true);
        this.reservationService.addToWaitlist({
            film_id: this.wlFilmId()!,
            customer_id: this.wlCustomerId()!,
            store_id: this.wlStore()
        }).subscribe({
            next: () => {
                this.wlSaving.set(false);
                this.toast.show('Added to waitlist', 'success');
                this.wlCustomerId.set(null);
                this.wlCustomerQuery.set('');
                this.wlFilmId.set(null);
                this.wlFilmQuery.set('');
                this.wlStore.set(null);
                this.loadWaitlist();
            },
            error: err => {
                this.wlSaving.set(false);
                this.toast.show(err.error?.error ?? err.message, 'error');
            }
        });
    }

    removeWaitlist(entry: WaitlistEntry) {
        this.reservationService.removeFromWaitlist(entry.waitlist_id).subscribe({
            next: () => {
                this.toast.show(`Removed ${entry.customer_name} for ${entry.title}`, 'success');
                this.loadWaitlist();
            },
            error: err => this.toast.show(err.error?.error ?? err.message, 'error')
        });
    }

    openPromote(entry: WaitlistEntry) {
        this.promoteEntry.set(entry);
        this.promoteCopies.set([]);
        this.promoteError.set(null);
        this.promoteDays.set('3');
        this.promoteOpen.set(true);
        this.promoteLoading.set(true);
        this.inventoryService.listInventory({ page: 1, pageSize: 50, search: entry.title }).subscribe({
            next: page => {
                this.promoteCopies.set(page.items.filter(c => !c.rented && !c.held));
                this.promoteLoading.set(false);
            },
            error: err => {
                this.promoteError.set(err.error?.error ?? err.message);
                this.promoteLoading.set(false);
            }
        });
    }

    closePromote() {
        this.promoteOpen.set(false);
        this.promoteEntry.set(null);
    }

    onPromoteDaysChange(value: string) {
        this.promoteDays.set(value);
    }

    promote(copy: Inventory) {
        const entry = this.promoteEntry();
        if (!entry) return;
        this.promoteSaving.set(true);
        this.promoteError.set(null);
        this.reservationService.promoteWaitlist({
            inventory_id: copy.inventory_id,
            days: Number(this.promoteDays())
        }).subscribe({
            next: res => {
                this.promoteSaving.set(false);
                this.promoteOpen.set(false);
                this.promoteEntry.set(null);
                this.toast.show(`Copy #${copy.inventory_id} held for ${res.customer_name}`, 'success');
                this.loadWaitlist();
                this.loadHolds();
            },
            error: err => {
                this.promoteSaving.set(false);
                this.promoteError.set(err.error?.error ?? err.message);
            }
        });
    }

    goInventory() {
        this.router.navigateByUrl('/inventory');
    }

    stopClick(event: Event) {
        event.stopPropagation();
    }
}

function pageWindow(current: number, last: number): number[] {
    const start = Math.max(1, Math.min(current - 2, last - 4));
    const end = Math.min(last, start + 4);
    const out: number[] = [];
    for (let i = start; i <= end; i++) out.push(i);
    return out;
}