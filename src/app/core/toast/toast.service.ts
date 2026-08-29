import { Service, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

let nextId = 1;

@Service()
export class ToastService {
    private readonly list = signal<Toast[]>([]);
    readonly toasts = this.list.asReadonly();

    show(message: string, type: ToastType = 'info', durationMs = 4000): void {
        const id = nextId++;
        this.list.update(items => [...items, { id, type, message }]);
        setTimeout(() => this.dismiss(id), durationMs);
    }

    dismiss(id: number): void {
        this.list.update(items => items.filter(t => t.id !== id));
    }
}