import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { DashboardService, MonthRentals, Stats, CategoryCount, RecentRental, TopFilm, CategoryRentals } from './dashboard.service';

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
  protected readonly topFilms = signal<TopFilm[]>([]);
  protected readonly topCategoryRentals = signal<CategoryRentals[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    forkJoin({
      stats: this.dashboard.getStats(),
      months: this.dashboard.getRentalsPerMonth(),
      categories: this.dashboard.getTopCategories(),
      recent: this.dashboard.getRecentRentals(),
      topFilms: this.dashboard.getTopFilms(),
      topCategoryRentals: this.dashboard.getTopFilmsByCategory()
    }).subscribe({
      next: res => {
        this.stats.set(res.stats);
        this.months.set(res.months);
        this.categories.set(res.categories);
        this.recent.set(res.recent);
        this.topFilms.set(res.topFilms);
        this.topCategoryRentals.set(res.topCategoryRentals);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  protected barPercent(count: number): number {
    const max = this.months().reduce((m, r) => Math.max(m, r.count), 1);
    return Math.round((count / max) * 100);
  }

  protected listMax(items: { times_rented?: number; rentals?: number }[]): number {
    return items.reduce((m, r) => Math.max(m, r.times_rented ?? r.rentals ?? 0), 1);
  }
}