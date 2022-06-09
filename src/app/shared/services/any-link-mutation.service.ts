import {FetchResult} from '@apollo/client/core';
import {Injectable} from '@angular/core';
import {debug, LinkableObject, Literal} from '@ecodev/natural';

import {delay, Observable, of} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AnyLinkMutationService {
    public constructor() {}

    public link(
        obj1: LinkableObject,
        obj2: LinkableObject,
        otherName: string | null = null,
        variables: Literal = {},
    ): Observable<FetchResult<{id: string}>> {
        return of({data: obj1}).pipe(debug('Mock NaturalLinkMutationService.link()'), delay(500));
    }

    public linkMany(
        obj1: LinkableObject,
        objSet: LinkableObject[],
        otherName: string | null = null,
        variables: Literal = {},
    ): Observable<FetchResult<{id: string}>[]> {
        return of([{data: obj1}]).pipe(debug('Mock NaturalLinkMutationService.linkMany()'), delay(500));
    }

    public unlink(
        obj1: LinkableObject,
        obj2: LinkableObject,
        otherName: string | null = null,
    ): Observable<FetchResult<{id: string}>> {
        return of({data: obj1}).pipe(debug('Mock NaturalLinkMutationService.unlink()'), delay(500));
    }
}
