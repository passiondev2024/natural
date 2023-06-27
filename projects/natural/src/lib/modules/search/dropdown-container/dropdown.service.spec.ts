import {TestBed} from '@angular/core/testing';
import {NaturalDropdownService} from './dropdown.service';

describe('DropdownService', () => {
    let service: NaturalDropdownService;

    beforeEach(() => {
        service = TestBed.inject(NaturalDropdownService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
