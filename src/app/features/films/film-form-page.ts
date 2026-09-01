import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FilmService } from '../films/film.service';
import { Film, Language, FilmInput } from '../films/film';
import { ToastService } from '../../core/toast/toast.service';

const RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17'] as const;
const SPECIAL_FEATURES = ['Trailers', 'Commentaries', 'Deleted Scenes', 'Behind the Scenes'] as const;

@Component({
    selector: 'app-film-form-page',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './film-form-page.html',
    styleUrl: './film-form-page.css',
})
export class FilmFormPage implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly filmService = inject(FilmService);
    private readonly toast = inject(ToastService);

    protected readonly mode = signal<'new' | 'edit'>('new');
    protected readonly filmId = signal<number | null>(null);
    protected readonly loadError = signal<string | null>(null);
    protected readonly saving = signal(false);

    protected readonly title = signal('');
    protected readonly description = signal('');
    protected readonly releaseYear = signal<number | null>(null);
    protected readonly languageId = signal<number | null>(null);
    protected readonly rentalDuration = signal<number | null>(3);
    protected readonly rentalRate = signal('');
    protected readonly length = signal<number | null>(null);
    protected readonly replacementCost = signal('');
    protected readonly rating = signal<string>('G');
    protected readonly specialFeatures = signal<string[]>([]);

    protected readonly languages = signal<Language[]>([]);
    protected readonly ratings = RATINGS;
    protected readonly specialFeaturesOptions = SPECIAL_FEATURES;

    protected readonly titleError = computed(() => this.title().trim() === '');
    protected readonly languageError = computed(() => this.languageId() === null);
    protected readonly formValid = computed(() => !this.titleError() && !this.languageError());

    ngOnInit() {
        this.filmService.getLanguages().subscribe({
            next: rows => {
                this.languages.set(rows);
                const id = this.route.snapshot.paramMap.get('id');
                if (id) {
                    this.mode.set('edit');
                    this.filmId.set(Number(id));
                    this.filmService.getFilm(Number(id)).subscribe({
                        next: f => this.loadEdit(f),
                        error: err => this.loadError.set(err.error?.error ?? err.message)
                    });
                } else if (rows.length > 0) {
                    this.languageId.set(rows[0].language_id);
                }
            }
        });
    }

    private loadEdit(f: Film) {
        this.title.set(f.title);
        this.description.set(f.description ?? '');
        this.releaseYear.set(f.release_year);
        this.languageId.set(f.language_id);
        this.rentalDuration.set(f.rental_duration ?? 3);
        this.rentalRate.set(f.rental_rate ?? '');
        this.length.set(f.length);
        this.replacementCost.set(f.replacement_cost ?? '');
        this.rating.set(f.rating && (this.ratings as readonly string[]).includes(f.rating) ? f.rating : 'G');
        this.specialFeatures.set(f.special_features ? f.special_features.slice() : []);
    }

    onReleaseYearInput(value: string) {
        this.releaseYear.set(value === '' ? null : Number(value));
    }

    onRentalDurationInput(value: string) {
        this.rentalDuration.set(value === '' ? null : Number(value));
    }

    onLengthInput(value: string) {
        this.length.set(value === '' ? null : Number(value));
    }

    onLanguageChange(value: string) {
        this.languageId.set(value === '' ? null : Number(value));
    }

    toggleSpecialFeature(feature: string, checked: boolean) {
        if (checked) {
            if (!this.specialFeatures().includes(feature)) {
                this.specialFeatures.update(list => [...list, feature]);
            }
        } else {
            this.specialFeatures.update(list => list.filter(x => x !== feature));
        }
    }

    submit() {
        if (!this.formValid() || this.saving()) return;
        this.saving.set(true);
        const input: FilmInput = {
            title: this.title().trim(),
            description: this.description().trim() === '' ? null : this.description().trim(),
            release_year: this.releaseYear(),
            language_id: this.languageId()!,
            rental_duration: this.rentalDuration(),
            rental_rate: this.rentalRate() === '' ? null : this.rentalRate(),
            length: this.length(),
            replacement_cost: this.replacementCost() === '' ? null : this.replacementCost(),
            rating: this.rating(),
            special_features: this.specialFeatures().length > 0 ? this.specialFeatures() : null
        };

        const action = this.mode() === 'edit'
            ? this.filmService.updateFilm(this.filmId()!, input)
            : this.filmService.createFilm(input);

        action.subscribe({
            next: () => {
                this.toast.show(this.mode() === 'edit' ? 'Film updated' : 'Film created', 'success');
                this.router.navigateByUrl('/films');
            },
            error: err => {
                this.saving.set(false);
                this.toast.show(err.error?.message ?? err.message, 'error');
            }
        });
    }

    cancel() {
        this.router.navigateByUrl('/films');
    }
}
