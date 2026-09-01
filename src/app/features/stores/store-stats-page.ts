import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from './store.service';
import { Store, StoreStats } from './store';
import { ToastService } from '../../core/toast/toast.service';

@Component({
    selector: 'app-store-stats-page',
    standalone: true,
    templateUrl: './store-stats-page.html',
    styleUrl: './store-stats-page.css',
})
export class StoreStatsPage implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly storeService = inject(StoreService);
    private readonly toast = inject(ToastService);

    protected readonly loading = signal(false);
    protected readonly error = signal<string | null>(null);
    protected readonly store = signal<Store | null>(null);
    protected readonly stats = signal<StoreStats | null>(null);

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.loading.set(true);
        this.storeService.getStore(id).subscribe({
            next: s => this.store.set(s),
            error: err => {
                this.error.set(err.error?.error ?? err.message);
                this.toast.show(err.error?.error ?? err.message, 'error');
            }
        });
        this.storeService.getStoreStats(id).subscribe({
            next: st => {
                this.stats.set(st);
                this.loading.set(false);
            },
            error: err => {
                this.error.set(err.error?.error ?? err.message);
                this.toast.show(err.error?.error ?? err.message, 'error');
                this.loading.set(false);
            }
        });
    }

    back() {
        this.router.navigateByUrl('/stores');
    }
}