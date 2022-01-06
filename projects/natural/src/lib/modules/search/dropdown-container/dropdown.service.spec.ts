import {OverlayModule} from '@angular/cdk/overlay';
import {TestBed} from '@angular/core/testing';
import {NaturalDropdownService} from './dropdown.service';

describe('DropdownService', () => {
    let service: NaturalDropdownService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [OverlayModule],
        });
        service = TestBed.inject(NaturalDropdownService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
