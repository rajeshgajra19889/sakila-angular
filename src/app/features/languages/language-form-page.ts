import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from './language.service';
import { ToastService } from '../../core/toast/toast.service';

@Component({
    selector: 'app-language-form-page',
    standalone: true,
    templateUrl: './language-form-page.html',
    styleUrl: './language-form-page.css',
})
export class LanguageFormPage implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly langService = inject(LanguageService);
    private readonly toast = inject(ToastService);

    protected readonly mode = signal<'new' | 'edit'>('new');
    protected readonly languageId = signal<number | null>(null);
    protected readonly loadError = signal<string | null>(null);
    protected readonly saving = signal(false);
    protected readonly name = signal('');

    protected readonly nameError = computed(() => this.name().trim() === '');
    protected readonly formValid = computed(() => !this.nameError());

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.mode.set('edit');
            this.languageId.set(Number(id));
            this.langService.getLanguage(Number(id)).subscribe({
                next: l => this.name.set(l.name),
                error: () => { this.loadError.set('Failed to load language.'); this.toast.show('Failed to load language', 'error'); }
            });
        }
    }

    submit() {
        if (!this.formValid() || this.saving()) return;
        this.saving.set(true);
        const action = this.mode() === 'edit'
            ? this.langService.updateLanguage(this.languageId()!, { name: this.name().trim() })
            : this.langService.createLanguage({ name: this.name().trim() });
        action.subscribe({
            next: () => {
                this.toast.show(this.mode() === 'edit' ? 'Language updated' : 'Language created', 'success');
                this.router.navigateByUrl('/languages');
            },
            error: err => { this.saving.set(false); this.toast.show(err.error?.message ?? err.message, 'error'); }
        });
    }

    cancel() { this.router.navigateByUrl('/languages'); }
}