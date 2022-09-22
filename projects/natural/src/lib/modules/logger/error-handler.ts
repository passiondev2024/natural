import {DOCUMENT} from '@angular/common';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ErrorHandler, Inject, Injectable, InjectionToken, Optional} from '@angular/core';
import {catchError, EMPTY, first, Observable, of} from 'rxjs';

export interface NaturalLoggerType {
    message: string;
    stacktrace?: string;
    href?: string;
    host?: string;
    path?: string;
    agent?: string;
    status?: number;
    referrer?: string;
    url?: string;
    userId?: string;
    user?: string;

    [key: string]: any;
}

export interface NaturalLoggerExtra {
    /**
     * Return an observable of extra data that will be logged. Those data will be merged into
     * the original data, and so it can override things.
     *
     * Only the first emitted value will be used.
     */
    getExtras(error: unknown): Observable<Partial<NaturalLoggerType>>;
}

export const NaturalLoggerConfigUrl = new InjectionToken<string>('Absolute URL of the log server');
export const NaturalLoggerConfigExtra = new InjectionToken<NaturalLoggerExtra>(
    'Class that may provide extra data to log',
);

/**
 * Replace Angular's error handler to also send the log to a remote server via HTTP POST.
 *
 * Usage is automatic as soon we import the module via:
 *
 * ```ts
 * NaturalErrorModule.forRoot('http://example.com', ExtraService),
 * ```
 */
@Injectable({
    providedIn: 'root',
})
export class NaturalErrorHandler extends ErrorHandler {
    public constructor(
        private readonly http: HttpClient,
        @Inject(DOCUMENT) private readonly document: Document,
        @Optional() @Inject(NaturalLoggerConfigUrl) private readonly url: string,
        @Optional() @Inject(NaturalLoggerConfigExtra) private readonly loggerExtra?: NaturalLoggerExtra,
    ) {
        super();
    }

    public handleError(error: any): void {
        console.error(error);

        const params: NaturalLoggerType = {
            message: this.toMessage(error),
            href: this.document.defaultView?.window.location.href,
            host: this.document.defaultView?.window.location.hostname,
            path: this.document.defaultView?.window.location.pathname,
            agent: this.document.defaultView?.window.navigator.userAgent,
            level: 'error',
        };

        if (error?.stack) {
            params.stacktrace = error.stack;
        }

        if (typeof error?.status !== 'undefined') {
            params.status = error.status;
        }

        if (error?.referrer) {
            params.referrer = error.referrer;
        }

        if (error?.url) {
            params.url = error.url;
        }

        if (this.loggerExtra) {
            this.loggerExtra
                .getExtras(error)
                .pipe(
                    catchError(e => of({getExtrasErrorMessage: this.toMessage(e)})),
                    first(),
                )
                .subscribe(result => {
                    this.postLog(Object.assign(params, result));
                });
        } else {
            this.postLog(params);
        }
    }

    private toMessage(error: any): string {
        if (error && typeof error === 'object' && 'message' in error) {
            return '' + error.message;
        } else {
            return '' + error;
        }
    }

    /**
     * Send parameters to remote log
     */
    private postLog(params: NaturalLoggerType): void {
        if (this.url) {
            this.http
                .post(this.url, params, {headers: new HttpHeaders().set('content-type', 'application/json')})
                .pipe(catchError(() => EMPTY))
                .subscribe();
        }
    }
}
