import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActorService, ActorQuery } from './actor.service';
import { Actor, ActorDetail } from './actor';
import { ToastService } from '../../core/toast/toast.service';

@Component({
    selector: 'app-actors-page',
    styleUrl: './actors-page.css',
    templateUrl: './actors-page.html',
})
export class ActorsPage implements OnInit {
    private readonly actorService = inject(ActorService);
    private readonly toast = inject(ToastService);

    protected readonly actors = signal<Actor[]>([]);
    protected readonly total = signal(0);
    protected readonly page = signal(1);
    protected readonly pageSize = signal(10);
    protected readonly search = signal('');
    protected readonly sortBy = signal<'actor_id' | 'first_name' | 'last_name'>('actor_id');
    protected readonly sortOrder = signal<'asc' | 'desc'>('asc');
    protected readonly loading = signal(false);

    protected readonly formFirst = signal('');
    protected readonly formLast = signal('');
    protected readonly showForm = signal(false);
    protected readonly editing = signal<Actor | null>(null);

    protected readonly firstError = computed(() => this.formFirst().trim() === '');
    protected readonly lastError = computed(() => this.formLast().trim() === '');
    protected readonly formValid = computed(() => !this.firstError() && !this.lastError());

    protected readonly detailOpen = signal(false);
    protected readonly detailLoading = signal(false);
    protected readonly detailError = signal<string | null>(null);
    protected readonly detail = signal<ActorDetail | null>(null);

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
        this.loadActors();
    }

    loadActors() {
        this.loading.set(true);
        const query: ActorQuery = {
            page: this.page(),
            pageSize: this.pageSize(),
            search: this.search(),
            sortBy: this.sortBy(),
            sortOrder: this.sortOrder()
        };
        this.actorService.listActors(query).subscribe({
            next: result => {
                this.actors.set(result.items);
                this.total.set(result.total);
                this.loading.set(false);
            },
            error: err => {
                this.toast.show(err.message, 'error');
                this.loading.set(false);
            }
        });
    }

    goToPage(p: number) { if (p < 1 || p > this.totalPages()) return; this.page.set(p); this.loadActors(); }
    onSearch(value: string) { this.search.set(value); this.page.set(1); this.loadActors(); }
    onPageSizeChange(size: string) { this.pageSize.set(Number(size)); this.page.set(1); this.loadActors(); }

    onSort(column: 'actor_id' | 'first_name' | 'last_name') {
        if (this.sortBy() === column) this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
        else { this.sortBy.set(column); this.sortOrder.set('asc'); }
        this.loadActors();
    }

    sortIndicator(column: 'actor_id' | 'first_name' | 'last_name'): string {
        if (this.sortBy() !== column) return '';
        return this.sortOrder() === 'asc' ? '▲' : '▼';
    }

    openCreate() {
        this.editing.set(null);
        this.formFirst.set('');
        this.formLast.set('');
        this.showForm.set(true);
    }

    editActor(actor: Actor) {
        this.editing.set(actor);
        this.formFirst.set(actor.first_name);
        this.formLast.set(actor.last_name);
        this.showForm.set(true);
    }

    resetForm() {
        this.editing.set(null);
        this.formFirst.set('');
        this.formLast.set('');
        this.showForm.set(false);
    }

    stopClick(event: Event) { event.stopPropagation(); }

    saveActor() {
        const input = { first_name: this.formFirst().trim(), last_name: this.formLast().trim() };
        const wasEditing = this.editing() !== null;
        const action = wasEditing
            ? this.actorService.updateActor(this.editing()!.actor_id, input)
            : this.actorService.createActor(input);
        action.subscribe({
            next: () => {
                this.resetForm();
                this.loadActors();
                this.toast.show(wasEditing ? 'Actor updated' : 'Actor created', 'success');
            },
            error: err => this.toast.show(err.message, 'error')
        });
    }

    deleteActor(actor: Actor) {
        if (!window.confirm(`Delete ${actor.first_name} ${actor.last_name}?`)) return;
        this.actorService.deleteActor(actor.actor_id).subscribe({
            next: () => {
                if (this.actors().length === 1 && this.page() > 1) this.goToPage(this.page() - 1);
                else this.loadActors();
                this.toast.show(`${actor.first_name} ${actor.last_name} deleted`, 'success');
            },
            error: err => {
                const msg = err.error?.error ?? err.message;
                this.toast.show(msg, 'error');
            }
        });
    }

    openDetail(actor: Actor) {
        this.detail.set(null);
        this.detailError.set(null);
        this.detailOpen.set(true);
        this.detailLoading.set(true);
        this.actorService.getActor(actor.actor_id).subscribe({
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
}