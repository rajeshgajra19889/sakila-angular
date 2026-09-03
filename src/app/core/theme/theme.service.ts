import { Injectable, signal, effect } from '@angular/core';

const STORAGE_KEY = 'sakila_theme';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly _isDark = signal<boolean>(false);
    readonly isDark = this._isDark.asReadonly();

    constructor() {
        effect(() => {
            const dark = this._isDark();
            document.documentElement.classList.toggle('dark', dark);
            try {
                localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
            } catch {
                /* storage unavailable */
            }
        });
        this._isDark.set(this.initialTheme());
    }

    private initialTheme(): boolean {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'dark') return true;
            if (saved === 'light') return false;
        } catch {
            /* fall through to system */
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    toggle(): void {
        this._isDark.update(v => !v);
    }
}
