import { inject, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { IEnum, NaturalEnumService } from '../../../services/enum.service';
import { NaturalEnumPipe } from './enum.pipe';

class NaturalEnumServiceStub {

    public get(name: string): Observable<IEnum[]> {
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

describe('NaturalEnumPipe', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                {
                    provide: NaturalEnumPipe,
                    useClass: NaturalEnumPipe,
                },
                {
                    provide: NaturalEnumService,
                    useClass: NaturalEnumServiceStub,
                },
            ],
        });
    });

    it('can get name of enum value', inject([NaturalEnumPipe], (pipe: NaturalEnumPipe) => {
        expect(pipe).toBeTruthy();

        pipe.transform('val1', 'enumName').subscribe(name => {
            expect(name).toBe('name1');
        });

        pipe.transform('val3', 'enumName').subscribe(name => {
            expect(name).toBe('name3');
        });

        pipe.transform(null, 'enumName').subscribe(name => {
            expect(name).toBe(null);
        });
    }));
});
