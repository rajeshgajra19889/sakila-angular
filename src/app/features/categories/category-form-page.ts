import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from './category.service';
import { ToastService } from '../../core/toast/toast.service';

@Component({
    selector: 'app-category-form-page',
    standalone: true,
    templateUrl: './category-form-page.html',
    styleUrl: './category-form-page.css',
})
export class CategoryFormPage implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly catService = inject(CategoryService);
    private readonly toast = inject(ToastService);

    protected readonly mode = signal<'new' | 'edit'>('new');
    protected readonly categoryId = signal<number | null>(null);
    protected readonly loadError = signal<string | null>(null);
    protected readonly saving = signal(false);
    protected readonly name = signal('');

    protected readonly nameError = computed(() => this.name().trim() === '');
    protected readonly formValid = computed(() => !this.nameError());

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.mode.set('edit');
            this.categoryId.set(Number(id));
            this.catService.getCategory(Number(id)).subscribe({
                next: c => this.name.set(c.name),
                error: () => { this.loadError.set('Failed to load category.'); this.toast.show('Failed to load category', 'error'); }
            });
        }
    }

    submit() {
        if (!this.formValid() || this.saving()) return;
        this.saving.set(true);
        const action = this.mode() === 'edit'
            ? this.catService.updateCategory(this.categoryId()!, { name: this.name().trim() })
            : this.catService.createCategory({ name: this.name().trim() });
        action.subscribe({
            next: () => {
                this.toast.show(this.mode() === 'edit' ? 'Category updated' : 'Category created', 'success');
                this.router.navigateByUrl('/categories');
            },
            error: err => { this.saving.set(false); this.toast.show(err.error?.message ?? err.message, 'error'); }
        });
    }

    cancel() { this.router.navigateByUrl('/categories'); }
}