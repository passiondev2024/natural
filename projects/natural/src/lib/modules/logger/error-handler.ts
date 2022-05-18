import {DOCUMENT} from '@angular/common';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ErrorHandler, Inject, Injectable, InjectionToken, Optional} from '@angular/core';
import {Literal} from '../../types/types';
import {catchError, EMPTY, first, Observable, of} from 'rxjs';

export interface NaturalLoggerType {
    href?: string;
    host?: string;
    path?: string;
    agent?: string;
    message: string;
    stacktrace: string;
    status?: number;
    referrer?: string;
    url?: string;
    userId?: string;
    user?: string;

    [key: string]: any;
}

export interface NaturalLoggerExtra {
    getExtras(error: unknown): Observable<Partial<NaturalLoggerType>>;
}

export const NaturalLoggerConfigUrl = new InjectionToken<string>('NaturalLoggerConfigUrl');
export const NaturalLoggerConfigExtra = new InjectionToken<NaturalLoggerExtra>('NaturalLoggerConfigExtra');

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

        const params: Partial<NaturalLoggerType> = {
            href: this.document.defaultView?.window.location.href,
            host: this.document.defaultView?.window.location.hostname,
            path: this.document.defaultView?.window.location.pathname,
            agent: this.document.defaultView?.window.navigator.userAgent,
            level: 'error',
        };

        if (error?.message) {
            params.message = error.message;
        } else {
            params.message = error;
        }

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
                ?.getExtras(error)
                .pipe(
                    catchError(e => {
                        const message = e && typeof e === 'object' && 'message' in e ? e.message : '' + e;

                        return of({getExtrasErrorMessage: message});
                    }),
                    first(),
                )
                .subscribe(result => {
                    this.postLog(Object.assign(params, result));
                });
        } else {
            this.postLog(params);
        }
    }

    /**
     * Send parameters to remote log
     */
    private postLog(params: Literal): void {
        if (this.url) {
            this.http
                .post(this.url, params, {headers: new HttpHeaders().set('content-type', 'application/json')})
                .pipe(
                    catchError(() => {
                        return EMPTY;
                    }),
                )
                .subscribe();
        }
    }
}
