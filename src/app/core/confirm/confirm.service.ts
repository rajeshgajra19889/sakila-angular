import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
}

interface ConfirmRequest extends ConfirmOptions {
    id: number;
    resolve: (result: boolean) => void;
}

let nextId = 1;

@Injectable({ providedIn: 'root' })
export class ConfirmService {
    private _current = signal<ConfirmRequest | null>(null);
    readonly current = this._current.asReadonly();

    /** Returns a promise that resolves to true if the user confirms. */
    confirm(options: ConfirmOptions): Promise<boolean> {
        const id = nextId++;
        return new Promise<boolean>(resolve => {
            this._current.set({
                id,
                title: options.title ?? 'Please confirm',
                message: options.message,
                confirmLabel: options.confirmLabel ?? 'Confirm',
                cancelLabel: options.cancelLabel ?? 'Cancel',
                danger: options.danger ?? true,
                resolve,
            });
        });
    }

    resolveCurrent(result: boolean): void {
        const req = this._current();
        if (!req) return;
        this._current.set(null);
        req.resolve(result);
    }
}
