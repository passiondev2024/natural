import { inject, TestBed } from '@angular/core/testing';
import { NaturalEnumService } from '../../../services/enum.service';
import { NaturalEnumPipe } from './enum.pipe';
import '@angular/localize/init';
import { AnyEnumService } from '../../../testing/any-enum.service';
import { MockApolloProvider } from '../../../testing/mock-apollo.provider';

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
                    useClass: AnyEnumService,
                },
                MockApolloProvider,
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
