import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { StaffService } from './staff.service';
import { Staff, StaffQuery } from './staff';
import { ToastService } from '../../core/toast/toast.service';
import { ConfirmService } from '../../core/confirm/confirm.service';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-staff-list',
  styleUrl: './staff-list.css',
  templateUrl: './staff-list.html',
})
export class StaffList implements OnInit {
  private readonly staffService = inject(StaffService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly router=inject(Router);

  protected readonly staffs = signal<Staff[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly search = signal("");
  protected readonly sortBy = signal("staff_id");
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
    this.loadStaff();
  }

  loadStaff(): void {
    const query: StaffQuery = {
      page: this.page(),
      pageSize: this.pageSize(),
      search: this.search(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
    };
    this.staffService.listStaff(query).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.staffs.set(result.items);
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
    this.loadStaff();
  }
  onPageSizeChange(size: string) {
    this.pageSize.set(Number(size));
    this.page.set(1);
    this.loadStaff();
  }
  goToPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadStaff();
  }
  onSort(column: string) {
    if (this.sortBy() === column) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc')
    } else {
      this.sortBy.set(column);
      this.sortOrder.set('asc');
    }
    this.loadStaff();
  }
  sortIndicator(column: string): string {
    if (this.sortBy() !== column) return '';
    return this.sortOrder() === 'asc' ? '▲' : '▼';
  }
  addStaff() {
    this.router.navigateByUrl('/staffs/new');
  }

  editStaff(id: number) {
    this.router.navigateByUrl(`/staffs/${id}/edit`);
  }

  deleteStaff(id: number) {
    this.confirm.confirm({
      title: 'Delete staff member',
      message: 'Delete this staff member?',
      confirmLabel: 'Delete',
      danger: true
    }).then(ok => {
      if (!ok) return;
      this.staffService.deleteStaff(id).subscribe({
        next: () => {
          this.toast.show('Staff deleted', 'success');
          this.loadStaff();
        },
        error: (err) => this.toast.show(err.error?.message ?? err.message, 'error')
      });
    });
  }

}

