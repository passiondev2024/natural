import {Observable, of} from 'rxjs';
import {IEnum, NaturalEnumService} from '@ecodev/natural';
import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AnyEnumService extends NaturalEnumService {
    public get(): Observable<IEnum[]> {
        return of([
            {
                value: 'val1',
                name: 'name1',
            },
            {
                value: 'val2',
                name: 'name2',
            },
            {
                value: 'val3',
                name: 'name3',
            },
        ]);
    }
}
