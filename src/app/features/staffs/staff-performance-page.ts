import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StaffService } from './staff.service';
import { StaffPerformance } from './staff';
import { ToastService } from '../../core/toast/toast.service';

@Component({
    selector: 'app-staff-performance',
    standalone: true,
    templateUrl: './staff-performance.html',
    styleUrl: './staff-performance.css',
})
export class StaffPerformancePage implements OnInit {
    private readonly staffService = inject(StaffService);
    private readonly toast = inject(ToastService);
    private readonly router = inject(Router);

    protected readonly rows = signal<StaffPerformance[]>([]);
    protected readonly loading = signal(true);

    ngOnInit() { this.load(); }

    load() {
        this.loading.set(true);
        this.staffService.getPerformance().subscribe({
            next: r => { this.rows.set(r); this.loading.set(false); },
            error: () => { this.toast.show('Failed to load performance', 'error'); this.loading.set(false); }
        });
    }

    maxRevenue(): number { return Math.max(1, ...this.rows().map(r => r.revenue)); }

    totals() {
        const rows = this.rows();
        return {
            staff: rows.length,
            revenue: rows.reduce((s, r) => s + r.revenue, 0),
            payments: rows.reduce((s, r) => s + r.payments, 0),
            rentals: rows.reduce((s, r) => s + r.rentals, 0)
        };
    }

    openStaff(id: number) { this.router.navigateByUrl(`/staff/${id}`); }
    back() { this.router.navigateByUrl('/staff'); }
    fmt(n: number): string { return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 2 }); }
}
