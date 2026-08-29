import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { DashboardService, MonthRentals, Stats, CategoryCount, RecentRental } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly dashboard = inject(DashboardService);

  protected readonly stats = signal<Stats | null>(null);
  protected readonly months = signal<MonthRentals[]>([]);
  protected readonly categories = signal<CategoryCount[]>([]);
  protected readonly recent = signal<RecentRental[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    forkJoin({
      stats: this.dashboard.getStats(),
      months: this.dashboard.getRentalsPerMonth(),
      categories: this.dashboard.getTopCategories(),
      recent: this.dashboard.getRecentRentals()
    }).subscribe({
      next: res => {
        this.stats.set(res.stats);
        this.months.set(res.months);
        this.categories.set(res.categories);
        this.recent.set(res.recent);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  protected barPercent(count: number): number {
    const max = this.months().reduce((m, r) => Math.max(m, r.count), 1);
    return Math.round((count / max) * 100);
  }
}