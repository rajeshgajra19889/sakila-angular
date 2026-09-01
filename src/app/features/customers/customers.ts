import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CustomerService } from './customer.service';
import { Customer, CustomerDetail, CustomerQuery,CustomerPayment } from './customers.interface';
import { ToastService } from '../../core/toast/toast.service';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-customers',
  styleUrl: './customers.css',
  templateUrl: './customers.html',
})
export class Customers implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);

  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly search = signal('');
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
  //protected readonly sortBy = signal<'customer_id' | 'first_name' | 'last_name' | 'email'>('customer_id');
  protected readonly sortBy = signal('customer_id');
  protected readonly sortOrder = signal<'asc' | 'desc'>('asc');
  protected readonly customers = signal<Customer[]>([]);

  //Details start
  protected readonly detail = signal<CustomerDetail | null>(null);
  protected readonly detailError = signal<string | null>(null);
  protected readonly detailOpen = signal(false);
  protected readonly detailLoading = signal(false);
  
  

  //payments start
  protected readonly payments = signal<CustomerPayment[]>([]);
  protected readonly paymentError = signal<string | null>(null);
  protected readonly paymentOpen = signal(false);
  protected readonly paymentLoading = signal(false);
  protected readonly paymentCount = signal<number | null>(null);



  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    const query: CustomerQuery = {
      page: this.page(),
      pageSize: this.pageSize(),
      search: this.search(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder()
    };
    this.customerService.listCustomers(query).subscribe({
      next: result => {
        this.customers.set(result.items);
        this.total.set(result.total);
        this.loading.set(false);
      },
      error: err => {
        this.toast.show(err.message, 'error');
        this.loading.set(false);
      }
    });
  }

  onSort(column: string) {
    if (this.sortBy() === column) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(column);
      this.sortOrder.set('asc');
    }
    this.loadCustomers();
  }

  onPageSizeChange(size: string) {
    this.pageSize.set(Number(size));
    this.page.set(1);
    this.loadCustomers();
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadCustomers();
  }

  sortIndicator(column: string): string {
    if (this.sortBy() !== column) return '';
    return this.sortOrder() === 'asc' ? '▲' : '▼';
  }


  onSearch(value: string) {
    this.search.set(value);
    this.page.set(1);
    this.loadCustomers();
  }

  /*deleteCustomer(customer: Customer) {
    if (!window.confirm(`Delete ${customer.first_name} ${customer.last_name}?`)) return;
    this.customerService.deleteCustomer(customer.customer_id).subscribe({
      next: () => {
        if (this.customers().length === 1 && this.page() > 1) this.goToPage(this.page() - 1);
        else this.customers();
        this.toast.show(`${customer.first_name} ${customer.last_name} deleted`, 'success');
      },
      error: err => {
        const msg = err.error?.error ?? err.message;
        this.toast.show(msg, 'error');
      }
    });
  }*/

  openDetail(customer: Customer) {
    this.detail.set(null);
    this.detailError.set(null);
    this.detailOpen.set(true);
    this.detailLoading.set(true);
    this.customerService.getCustomer(customer.customer_id).subscribe({
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
  addCustomer() {
    this.router.navigateByUrl('/customers/new');
  }

  editCustomer(customer: Customer) {
    this.router.navigateByUrl(`/customers/${customer.customer_id}/edit`);
  }

   openPayment(customer: Customer) {
    this.payments.set([]);
    this.paymentError.set(null);
    this.paymentOpen.set(true);
    this.paymentLoading.set(true);
    this.customerService.getPaymentHistory(customer.customer_id).subscribe({
      next: d => {
        this.payments.set(d);
        this.paymentCount.set(d.length)
        this.paymentLoading.set(false);
      },
      error: err => {
        this.paymentError.set(err.error?.error ?? err.message);
        this.paymentLoading.set(false);
      }
    });
  }

   closePayment() {
    this.paymentOpen.set(false);
    this.payments.set([]);
  }
}