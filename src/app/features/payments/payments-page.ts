import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PaymentService } from './payment.service';
import { Payment, PaymentQuery } from './payment';
import { ToastService } from '../../core/toast/toast.service';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-payments-page',
  styleUrl: './payments-page.css',
  templateUrl: './payments-page.html',
})
export class PaymentsPage implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly payments = signal<Payment[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly search = signal("");
  protected readonly sortBy = signal("payment_id");
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

  protected readonly loading = signal(true);
  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    const query: PaymentQuery = {
      page: this.page(),
      pageSize: this.pageSize(),
      search: this.search(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
    };
    this.loading.set(true);
    this.paymentService.listPayments(query).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.payments.set(result.items);
        this.total.set(result.total);
      },
      error: (err) => {
        this.toast.show(err.message, "error");
        this.loading.set(false);
      }
    })
  }

  onSearch(value: string) {
    this.search.set(value);
    this.page.set(1);
    this.loadPayments();
  }
  onPageSizeChange(size: string) {
    this.pageSize.set(Number(size));
    this.page.set(1);
    this.loadPayments();
  }
  goToPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadPayments();
  }
  onSort(column: string) {
    if (this.sortBy() === column) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc')
    } else {
      this.sortBy.set(column);
      this.sortOrder.set('asc');
    }
    this.loadPayments();
  }
  sortIndicator(column: string): string {
    if (this.sortBy() !== column) return '';
    return this.sortOrder() === 'asc' ? '▲' : '▼';
  }

  fmtDate(iso: string): string {
    return iso ? iso.slice(0, 10) : '—';
  }

  addPayment() {
    this.router.navigateByUrl('/payments/new');
  }

  editPayment(id: number) {
    this.router.navigateByUrl(`/payments/${id}/edit`);
  }

  deletePayment(id: number) {
    if (!window.confirm('Delete this payment?')) return;
    this.paymentService.deletePayment(id).subscribe({
      next: () => {
        this.toast.show('Payment deleted', 'success');
        this.loadPayments();
      },
      error: (err) => this.toast.show(err.error?.message ?? err.message, 'error')
    });
  }
}