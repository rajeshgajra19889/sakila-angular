import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from './payment.service';
import { PaymentDetail, PaymentInput } from './payment';
import { CustomerService } from '../customers/customer.service';
import { Customer } from '../customers/customers.interface';
import { StaffService } from '../staffs/staff.service';
import { Staff } from '../staffs/staff';
import { RentalService } from '../rentals/rental.service';
import { Rental } from '../rentals/rental';
import { ToastService } from '../../core/toast/toast.service';

@Component({
    selector: 'app-payment-form-page',
    standalone: true,
    templateUrl: './payment-form-page.html',
    styleUrl: './payment-form-page.css',
})
export class PaymentFormPage implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly paymentService = inject(PaymentService);
    private readonly customerService = inject(CustomerService);
    private readonly staffService = inject(StaffService);
    private readonly rentalService = inject(RentalService);
    private readonly toast = inject(ToastService);

    protected readonly mode = signal<'new' | 'edit'>('new');
    protected readonly paymentId = signal<number | null>(null);
    protected readonly loadError = signal<string | null>(null);
    protected readonly saving = signal(false);

    protected readonly customers = signal<Customer[]>([]);
    protected readonly staffs = signal<Staff[]>([]);
    protected readonly rentals = signal<Rental[]>([]);

    protected readonly customerId = signal<number | null>(null);
    protected readonly staffId = signal<string>('');
    protected readonly rentalId = signal<string>('');
    protected readonly amount = signal('');
    protected readonly paymentDate = signal('');

    protected readonly customerError = computed(() => this.customerId() === null);
    protected readonly amountError = computed(() => {
        const n = Number(this.amount());
        return this.amount().trim() === '' || !isFinite(n) || n <= 0;
    });
    protected readonly dateError = computed(() => this.paymentDate().trim() === '');

    protected readonly formValid = computed(() =>
        !this.customerError() && !this.amountError() && !this.dateError()
    );

    ngOnInit() {
        this.customerService.listCustomers({ page: 1, pageSize: 100 }).subscribe({
            next: r => this.customers.set(r.items),
            error: () => this.toast.show('Failed to load customers', 'error')
        });
        this.staffService.listStaff({ page: 1, pageSize: 100 }).subscribe({
            next: r => this.staffs.set(r.items),
            error: () => this.toast.show('Failed to load staff', 'error')
        });
        this.rentalService.listRentals({ page: 1, pageSize: 100 }).subscribe({
            next: r => this.rentals.set(r.items),
            error: () => this.toast.show('Failed to load rentals', 'error')
        });

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.mode.set('edit');
            this.paymentId.set(Number(id));
            this.paymentService.getPayment(Number(id)).subscribe({
                next: p => this.prefill(p),
                error: () => {
                    this.loadError.set('Failed to load payment.');
                    this.toast.show('Failed to load payment', 'error');
                }
            });
        } else {
            this.paymentDate.set(new Date().toISOString().slice(0, 10));
        }
    }

    private prefill(p: PaymentDetail) {
        this.customerId.set(p.customer_id);
        this.staffId.set(p.staff_id != null ? String(p.staff_id) : '');
        this.rentalId.set(p.rental_id != null ? String(p.rental_id) : '');
        this.amount.set(p.amount);
        this.paymentDate.set(p.payment_date.slice(0, 10));
    }

    onCustomerChange(value: string) {
        this.customerId.set(value === '' || value === 'null' ? null : Number(value));
    }

    submit() {
        if (!this.formValid() || this.saving()) return;
        this.saving.set(true);

        const payload: PaymentInput = {
            customer_id: this.customerId()!,
            amount: Number(this.amount()),
            payment_date: this.paymentDate(),
            staff_id: this.staffId() === '' ? null : Number(this.staffId()),
            rental_id: this.rentalId() === '' ? null : Number(this.rentalId()),
        };

        const action = this.mode() === 'edit'
            ? this.paymentService.updatePayment(this.paymentId()!, payload)
            : this.paymentService.createPayment(payload);

        action.subscribe({
            next: () => {
                this.toast.show(this.mode() === 'edit' ? 'Payment updated' : 'Payment recorded', 'success');
                this.router.navigateByUrl('/payments');
            },
            error: err => {
                this.saving.set(false);
                this.toast.show(err.error?.message ?? err.message, 'error');
            }
        });
    }

    cancel() {
        this.router.navigateByUrl('/payments');
    }
}