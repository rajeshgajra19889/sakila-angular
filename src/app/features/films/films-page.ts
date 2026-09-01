import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FilmService, FilmQuery } from './film.service';
import { Film } from './film';
import { ToastService } from '../../core/toast/toast.service';
import { forkJoin } from 'rxjs';
import { Actor } from '../actors/actor';

@Component({
    selector: 'app-films-page',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './films-page.html',
    styleUrl: './films-page.css'
})
export class FilmsPage implements OnInit {
    private readonly filmService = inject(FilmService);
    private readonly toast = inject(ToastService);

    protected readonly films = signal<Film[]>([]);
    protected readonly total = signal(0);
    protected readonly page = signal(1);
    protected readonly pageSize = signal(10);
    protected readonly search = signal('');
    protected readonly sortBy = signal<'film_id' | 'title' | 'release_year' | 'rental_rate'>('film_id');
    protected readonly sortOrder = signal<'asc' | 'desc'>('asc');
    protected readonly loading = signal(false);

    protected readonly detailOpen = signal(false);
    protected readonly detailLoading = signal(false);
    protected readonly detailError = signal<string | null>(null);
    protected readonly detail = signal<Film | null>(null);
    protected readonly cast = signal<Actor[]>([]);

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
}
