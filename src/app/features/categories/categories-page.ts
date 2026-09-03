import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from './category.service';
import { Category } from './category';
import { ToastService } from '../../core/toast/toast.service';
import { ConfirmService } from '../../core/confirm/confirm.service';

@Component({
    selector: 'app-categories-page',
    templateUrl: './categories-page.html',
    styleUrl: './categories-page.css',
})
export class CategoriesPage implements OnInit {
    private readonly catService = inject(CategoryService);
    private readonly toast = inject(ToastService);
    private readonly confirm = inject(ConfirmService);
    private readonly router = inject(Router);

    protected readonly categories = signal<Category[]>([]);
    protected readonly loading = signal(true);

    ngOnInit() { this.load(); }

    load() {
        this.loading.set(true);
        this.catService.listCategories().subscribe({
            next: r => { this.categories.set(r); this.loading.set(false); },
            error: () => { this.toast.show('Failed to load categories', 'error'); this.loading.set(false); }
        });
    }

    add() { this.router.navigateByUrl('/categories/new'); }
    edit(id: number) { this.router.navigateByUrl(`/categories/${id}/edit`); }
    delete(id: number) {
        this.confirm.confirm({
            title: 'Delete category',
            message: 'Delete this category?',
            confirmLabel: 'Delete',
            danger: true
        }).then(ok => {
            if (!ok) return;
            this.catService.deleteCategory(id).subscribe({
                next: () => { this.toast.show('Category deleted', 'success'); this.load(); },
                error: (err) => this.toast.show(err.error?.message ?? err.message, 'error')
            });
        });
    }
}