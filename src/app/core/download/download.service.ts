import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../environments/environment';

@Service()
export class DownloadService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    exportCsv(path: string, params: Record<string, string | number | undefined> = {}) {
        return this.http.get(`${this.baseUrl}${path}`, {
            params: this.buildParams(params),
            responseType: 'blob'
        });
    }

    triggerDownload(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    private buildParams(params: Record<string, string | number | undefined>): HttpParams {
        let p = new HttpParams();
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== '') p = p.set(k, String(v));
        }
        return p;
    }
}
