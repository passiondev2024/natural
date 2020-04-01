import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Observable, of, throwError } from 'rxjs';
import { PaginatedData } from '../classes/data-source';
import { NaturalQueryVariablesManager, QueryVariables } from '../classes/query-variable-manager';
import { FormValidators, NaturalAbstractModelService } from '../services/abstract-model.service';
import { delay } from 'rxjs/operators';
import { Item } from './any.service';

@Injectable({
    providedIn: 'root',
})
export class ErrorService extends NaturalAbstractModelService<Item,
    { id: string },
    PaginatedData<Item>,
    QueryVariables,
    never,
    never,
    never,
    never,
    never> {

    constructor(apollo: Apollo, protected router: Router,
    ) {
        super(apollo,
            'user',
            null,
            null,
            null,
            null,
            null);
    }

    public watchAll(
        queryVariablesManager: NaturalQueryVariablesManager<QueryVariables>,
        expire: Observable<void>,
    ): Observable<PaginatedData<Item>> {
        return throwError(new Error('ErrorService.watchAll error')).pipe(delay(1000));
    }

    public getAll(
        queryVariablesManager: NaturalQueryVariablesManager<QueryVariables>,
    ): Observable<PaginatedData<Item>> {
        return throwError(new Error('ErrorService.getAll error')).pipe(delay(1000));
    }

    public getOne(id: string): Observable<Item> {
        return throwError(new Error('ErrorService.getOne error')).pipe(delay(1000));
    }

    protected getDefaultForClient() {
        return {
            name: '',
            description: '',
            children: [],
            parent: null,
        };
    }

    public getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(10)],
            description: [Validators.maxLength(20)],
        };
    }

    public count(queryVariablesManager: unknown): Observable<number> {
        return throwError(new Error('ErrorService.count error')).pipe(delay(1000));
    }
}
