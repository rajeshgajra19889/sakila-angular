import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from './language.service';
import { Language } from './language';
import { ToastService } from '../../core/toast/toast.service';
import { ConfirmService } from '../../core/confirm/confirm.service';

@Component({
    selector: 'app-languages-page',
    templateUrl: './languages-page.html',
    styleUrl: './languages-page.css',
})
export class LanguagesPage implements OnInit {
    private readonly langService = inject(LanguageService);
    private readonly toast = inject(ToastService);
    private readonly confirm = inject(ConfirmService);
    private readonly router = inject(Router);

    protected readonly languages = signal<Language[]>([]);
    protected readonly loading = signal(true);

    ngOnInit() { this.load(); }

    load() {
        this.loading.set(true);
        this.langService.listLanguages().subscribe({
            next: r => { this.languages.set(r); this.loading.set(false); },
            error: () => { this.toast.show('Failed to load languages', 'error'); this.loading.set(false); }
        });
    }

    add() { this.router.navigateByUrl('/languages/new'); }
    edit(id: number) { this.router.navigateByUrl(`/languages/${id}/edit`); }
    delete(id: number) {
        this.confirm.confirm({
            title: 'Delete language',
            message: 'Delete this language?',
            confirmLabel: 'Delete',
            danger: true
        }).then(ok => {
            if (!ok) return;
            this.langService.deleteLanguage(id).subscribe({
                next: () => { this.toast.show('Language deleted', 'success'); this.load(); },
                error: (err) => this.toast.show(err.error?.message ?? err.message, 'error')
            });
        });
    }
}