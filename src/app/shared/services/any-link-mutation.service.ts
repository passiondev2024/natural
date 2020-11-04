import {FetchResult} from '@apollo/client/core';
import {Injectable} from '@angular/core';
import {LinkableObject, Literal} from '@ecodev/natural';

import {Observable, of} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AnyLinkMutationService {
    constructor() {}

    public link(
        obj1: LinkableObject,
        obj2: LinkableObject,
        otherName: string | null = null,
        variables: Literal = {},
    ): Observable<FetchResult<{id: string}>> {
        return of({});
    }

    public linkMany(
        obj1: LinkableObject,
        objSet: LinkableObject[],
        otherName: string | null = null,
        variables: Literal = {},
    ): Observable<FetchResult<{id: string}>[]> {
        return of([{}]);
    }

    public unlink(
        obj1: LinkableObject,
        obj2: LinkableObject,
        otherName: string | null = null,
    ): Observable<FetchResult<{id: string}>> {
        return of({});
    }
}
