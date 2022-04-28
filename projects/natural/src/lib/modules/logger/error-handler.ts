import {DOCUMENT} from '@angular/common';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ErrorHandler, Inject, Injectable, InjectionToken, Optional} from '@angular/core';
import {Literal} from '@ecodev/natural';
import {catchError, EMPTY} from 'rxjs';

export interface LoggerExtra {
    getExtras(error: unknown): Literal;
}

export const NaturalLoggerConfigUrl = new InjectionToken<string>('NaturalLoggerConfigUrl');
export const NaturalLoggerConfigExtra = new InjectionToken<LoggerExtra>('NaturalLoggerConfigExtra');

@Injectable({
    providedIn: 'root',
})
export class NaturalErrorHandler extends ErrorHandler {
    public constructor(
        private http: HttpClient,
        @Inject(DOCUMENT) private readonly document: Document,
        @Optional() @Inject(NaturalLoggerConfigUrl) private readonly url: string,
        @Optional() @Inject(NaturalLoggerConfigExtra) private readonly loggerExtra?: LoggerExtra,
    ) {
        super();
    }

    public handleError(error: any): void {
        console.log('Error handler', error);

        const params: Literal = {
            error: error,
            url: this.document.defaultView?.window.location.href,
        };

        const headers = new HttpHeaders().set('content-type', 'application/json');
        if (this.loggerExtra) {
            params.extras = this.loggerExtra?.getExtras(error);
        }

        if (this.url) {
            this.http
                .post(this.url, params, {headers})
                .pipe(
                    catchError(() => {
                        console.log('Error submission error', error);

                        return EMPTY;
                    }),
                )
                .subscribe();
        }
    }
}
