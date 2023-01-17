import {FetchResult} from '@apollo/client/core';
import {Injectable} from '@angular/core';
import {debug, LinkableObject} from '@ecodev/natural';

import {delay, Observable, of} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AnyLinkMutationService {
    public link(obj1: LinkableObject): Observable<FetchResult<{id: string}>> {
        return of({data: obj1}).pipe(debug('Mock NaturalLinkMutationService.link()'), delay(500));
    }

    public linkMany(obj1: LinkableObject): Observable<FetchResult<{id: string}>[]> {
        return of([{data: obj1}]).pipe(debug('Mock NaturalLinkMutationService.linkMany()'), delay(500));
    }

    public unlink(obj1: LinkableObject): Observable<FetchResult<{id: string}>> {
        return of({data: obj1}).pipe(debug('Mock NaturalLinkMutationService.unlink()'), delay(500));
    }
}
