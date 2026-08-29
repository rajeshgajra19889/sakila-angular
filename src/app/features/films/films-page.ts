import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FilmService, FilmQuery } from './film.service';
import { Film, FilmInput } from './film';
import { ToastService } from '../../core/toast/toast.service';
import { forkJoin } from 'rxjs';
import { Actor } from '../actors/actor';
import { ActorService } from '../actors/actor.service';

@Component({
    selector: 'app-films-page',
    standalone: true,
    templateUrl: './films-page.html',
    styleUrl: './films-page.css'
})
export class FilmsPage implements OnInit {
    private readonly filmService = inject(FilmService);
    private readonly toast = inject(ToastService);
    private readonly actorService = inject(ActorService);

    protected readonly films = signal<Film[]>([]);
    protected readonly total = signal(0);
    protected readonly page = signal(1);
    protected readonly pageSize = signal(10);
    protected readonly search = signal('');
    protected readonly sortBy = signal<'film_id' | 'title' | 'release_year' | 'rental_rate'>('film_id');
    protected readonly sortOrder = signal<'asc' | 'desc'>('asc');
    protected readonly loading = signal(false);
    //protected readonly error = signal<string | null>(null);

    protected readonly formTitle = signal('');
    protected readonly formYear = signal<number | null>(null);
    protected readonly formRate = signal<string>('');
    protected readonly showForm = signal(false);

    protected readonly titleError = computed(() => this.formTitle().trim() === '');
    protected readonly yearError = computed(() => this.formYear() === null);
    protected readonly rateError = computed(() => {
        const v = this.formRate().trim();
        return v === '' || Number.isNaN(Number(v));
    });
    protected readonly formValid = computed(() => !this.titleError() && !this.yearError() && !this.rateError());
    protected readonly editing = signal<Film | null>(null);

    protected readonly detailOpen = signal(false);
    protected readonly detailLoading = signal(false);
    protected readonly detailError = signal<string | null>(null);
    protected readonly detail = signal<Film | null>(null);

    protected readonly cast = signal<Actor[]>([]);
    protected readonly castSaving = signal(false);
    protected readonly castQuery = signal('');
    protected readonly castSuggestions = signal<Actor[]>([]);

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

    ngOnInit() {
        this.loadFilms();
    }

    loadFilms() {
        this.loading.set(true);
        const query: FilmQuery = {
            page: this.page(),
            pageSize: this.pageSize(),
            search: this.search(),
            sortBy: this.sortBy(),
            sortOrder: this.sortOrder()
        };
        this.filmService.listFilms(query).subscribe({
            next: result => {
                this.films.set(result.items);
                this.total.set(result.total);
                this.loading.set(false);
            },
            error: err => {
                this.toast.show(err.message, 'error');
                this.loading.set(false);
            }
        });
    }

    goToPage(p: number) {
        if (p < 1 || p > this.totalPages()) return;
        this.page.set(p);
        this.loadFilms();
    }

    onSearch(value: string) {
        this.search.set(value);
        this.page.set(1);
        this.loadFilms();
    }

    onPageSizeChange(size: string) {
        this.pageSize.set(Number(size));
        this.page.set(1);
        this.loadFilms();
    }

    onSort(column: 'film_id' | 'title' | 'release_year' | 'rental_rate') {
        if (this.sortBy() === column) {
            this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortBy.set(column);
            this.sortOrder.set('asc');
        }
        this.loadFilms();
    }

    editFilm(film: Film) {
        this.editing.set(film);
        this.formTitle.set(film.title);
        this.formYear.set(film.release_year);
        this.formRate.set(film.rental_rate);
        this.showForm.set(true);
    }

    openDetail(film: Film) {
        this.detail.set(null);
        this.detailError.set(null);
        this.cast.set([]);
        this.detailOpen.set(true);
        this.detailLoading.set(true);
        forkJoin({
            film: this.filmService.getFilm(film.film_id),
            cast: this.filmService.getFilmActors(film.film_id)
        }).subscribe({
            next: ({ film: f, cast }) => {
                this.detail.set(f);
                this.cast.set(cast);
                this.detailLoading.set(false);
            },
            error: err => {
                this.detailError.set(err.message);
                this.detailLoading.set(false);
            }
        });
    }
    closeDetail() {
        this.detailOpen.set(false);
        this.detail.set(null);
    }

    resetForm() {
        this.editing.set(null);
        this.formTitle.set('');
        this.formYear.set(null);
        this.formRate.set('');
        this.showForm.set(false);   // ← this line
    }

    openCreate() {
        this.resetForm();
        this.showForm.set(true);
    }

    stopClick(event: Event) {
        event.stopPropagation();
    }

    saveFilm() {
        const input: FilmInput = {
            title: this.formTitle().trim(),
            release_year: this.formYear(),
            rental_rate: this.formRate() === '' ? null : this.formRate()
        };
        const action = this.editing()
            ? this.filmService.updateFilm(this.editing()!.film_id, input)
            : this.filmService.createFilm(input);

        const wasEditing = this.editing() !== null;
        action.subscribe({
            next: () => {
                this.resetForm();
                this.loadFilms();
                this.toast.show(wasEditing ? 'Film updated' : 'Film created', 'success');
            },
            error: err => this.toast.show(err.message, 'error')
        });
    }

    deleteFilm(film: Film) {
        if (!window.confirm(`Delete '${film.title}'?`)) return;
        this.filmService.deleteFilm(film.film_id).subscribe({
            next: () => {
                if (this.films().length === 1 && this.page() > 1) {
                    this.goToPage(this.page() - 1);
                } else {
                    this.loadFilms();
                }
                this.toast.show(`'${film.title}' deleted`, 'success');
            },
            error: err => this.toast.show(err.message, 'error')
        });
    }

    sortIndicator(column: 'film_id' | 'title' | 'release_year' | 'rental_rate'): string {
        if (this.sortBy() !== column) return '';
        return this.sortOrder() === 'asc' ? '▲' : '▼';
    }

    onYearInput(value: string) {
        this.formYear.set(value === '' ? null : Number(value));
    }

    private syncCast() {
        const filmId = this.detail()?.film_id;
        if (filmId === undefined) return;
        this.castSaving.set(true);
        this.filmService.setFilmActors(filmId, this.cast().map(a => a.actor_id)).subscribe({
            next: () => this.castSaving.set(false),
            error: err => {
                this.castSaving.set(false);
                this.toast.show(err.error?.error ?? err.message, 'error');
            }
        });
    }

    addCastActor(actor: Actor) {
        if (this.cast().some(a => a.actor_id === actor.actor_id)) return;
        this.cast.update(list => [...list, actor]);
        this.castQuery.set('');
        this.castSuggestions.set([]);
        this.syncCast();
    }

    removeCastActor(actorId: number) {
        this.cast.update(list => list.filter(a => a.actor_id !== actorId));
        this.syncCast();
    }

    onCastQuery(value: string) {
        this.castQuery.set(value);
        const q = value.trim().toLowerCase();
        if (q === '') {
            this.castSuggestions.set([]);
            return;
        }
        this.actorService.listActors({ page: 1, pageSize: 5, search: q }).subscribe({
            next: page => this.castSuggestions.set(page.items.filter(m => !this.cast().some(a => a.actor_id === m.actor_id))),
            error: () => this.castSuggestions.set([])
        });
    }
}