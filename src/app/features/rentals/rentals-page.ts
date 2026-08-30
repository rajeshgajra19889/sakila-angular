import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { RentalService } from "./rental.service";
import { Rental, RentalDetail, RentalQuery } from "./rental";
import { ToastService } from "../../core/toast/toast.service";

@Component({
  imports: [],
  selector: "app-rentals-page",
  styleUrl: "./rentals-page.css",
  templateUrl: "./rentals-page.html",
})
export class RentalsPage implements OnInit {
  private readonly rentalService = inject(RentalService);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly rentals = signal<Rental[]>([]);

  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly search = signal("");
  protected readonly sortBy = signal("rental_id");
  protected readonly sortOrder = signal<"asc" | "desc">("asc");
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

  //Details start
    protected readonly detail = signal<RentalDetail | null>(null);
    protected readonly detailError = signal<string | null>(null);
    protected readonly detailOpen = signal(false);
    protected readonly detailLoading = signal(false);

  ngOnInit() {
    this.loadRentals();
  }

  loadRentals(): void {
    const query: RentalQuery = {
      page: this.page(),
      pageSize: this.pageSize(),
      search: this.search(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
    };
    this.rentalService.listRentals(query).subscribe({
      next: (result) =>{
        this.rentals.set(result.items),
        this.total.set(result.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.show(err.message, "error");
        this.loading.set(false);
      },
    });
  }

  onSearch(value: string) {
    this.search.set(value);
    this.page.set(1);
    this.loadRentals();
  }

  onSort(column: string) {
    if (this.sortBy() === column) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc')
    } else {
      this.sortBy.set(column);
      this.sortOrder.set('asc');
    }
    this.loadRentals();
  }
  sortIndicator(column: string): string {
    if (this.sortBy() !== column) return '';
    return this.sortOrder() === 'asc' ? '▲' : '▼';
  }

  onPageSizeChange(size: string) {
    this.pageSize.set(Number(size));
    this.page.set(1);
    this.loadRentals();
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadRentals();
  }

  openDetail(rental: Rental) {
      this.detail.set(null);
      this.detailError.set(null);
      this.detailOpen.set(true);
      this.detailLoading.set(true);
      this.rentalService.getRental(rental.rental_id).subscribe({
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
