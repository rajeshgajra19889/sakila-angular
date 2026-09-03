import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PaymentService } from './payment.service';
import { Payment, PaymentQuery } from './payment';
import { StoreService } from '../stores/store.service';
import { Store } from '../stores/store';
import { CustomerService } from '../customers/customer.service';
import { Customer } from '../customers/customers.interface';
import { ToastService } from '../../core/toast/toast.service';
import { ConfirmService } from '../../core/confirm/confirm.service';
import { Router } from '@angular/router';
import { DownloadService } from '../../core/download/download.service';

@Component({
  imports: [],
  selector: 'app-payments-page',
  styleUrl: './payments-page.css',
  templateUrl: './payments-page.html',
})
export class PaymentsPage implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly storeService = inject(StoreService);
  private readonly customerService = inject(CustomerService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly router = inject(Router);
  private readonly download = inject(DownloadService);

  protected readonly payments = signal<Payment[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly search = signal("");
  protected readonly sortBy = signal("payment_id");
  protected readonly sortOrder = signal<"asc" | "desc">("asc");

  protected readonly stores = signal<Store[]>([]);
  protected readonly storeId = signal<number | null>(null);
  protected readonly customers = signal<Customer[]>([]);
  protected readonly customerId = signal<number | null>(null);
  protected readonly dateFrom = signal('');
  protected readonly dateTo = signal('');
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
    this.storeService.listStores().subscribe({
      next: s => this.stores.set(s),
      error: () => this.toast.show('Failed to load stores', 'error')
    });
    this.customerService.listCustomers({ page: 1, pageSize: 500 }).subscribe({
      next: c => this.customers.set(c.items),
      error: () => this.toast.show('Failed to load customers', 'error')
    });
    this.loadPayments();
  }

  loadPayments(): void {
    const query: PaymentQuery = {
      page: this.page(),
      pageSize: this.pageSize(),
      search: this.search(),
      customerId: this.customerId() ?? undefined,
      storeId: this.storeId() ?? undefined,
      dateFrom: this.dateFrom() || undefined,
      dateTo: this.dateTo() || undefined,
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

  onStoreChange(value: string) {
    this.storeId.set(value === '' || value === 'null' ? null : Number(value));
    this.page.set(1);
    this.loadPayments();
  }
  onCustomerChange(value: string) {
    this.customerId.set(value === '' || value === 'null' ? null : Number(value));
    this.page.set(1);
    this.loadPayments();
  }
  onDateFrom(value: string) {
    this.dateFrom.set(value);
    this.page.set(1);
    this.loadPayments();
  }
  onDateTo(value: string) {
    this.dateTo.set(value);
    this.page.set(1);
    this.loadPayments();
  }
  clearFilters() {
    this.storeId.set(null);
    this.customerId.set(null);
    this.dateFrom.set('');
    this.dateTo.set('');
    this.search.set('');
    this.page.set(1);
    this.loadPayments();
  }

  addPayment() {
    this.router.navigateByUrl('/payments/new');
  }

  exportCsv() {
    this.download.exportCsv('/payments/export', {
      search: this.search() || undefined,
      customerId: this.customerId() ?? undefined,
      storeId: this.storeId() ?? undefined,
      dateFrom: this.dateFrom() || undefined,
      dateTo: this.dateTo() || undefined,
    }).subscribe({
      next: blob => this.download.triggerDownload(blob, 'payments.csv'),
      error: () => this.toast.show('Failed to export payments', 'error')
    });
  }

  editPayment(id: number) {
    this.router.navigateByUrl(`/payments/${id}/edit`);
  }

  deletePayment(id: number) {
    this.confirm.confirm({
      title: 'Delete payment',
      message: 'Delete this payment?',
      confirmLabel: 'Delete',
      danger: true
    }).then(ok => {
      if (!ok) return;
      this.paymentService.deletePayment(id).subscribe({
        next: () => {
          this.toast.show('Payment deleted', 'success');
          this.loadPayments();
        },
        error: (err) => this.toast.show(err.error?.message ?? err.message, 'error')
      });
    });
  }
}