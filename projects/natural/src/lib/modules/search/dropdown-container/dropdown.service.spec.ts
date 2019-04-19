import { inject, TestBed } from '@angular/core/testing';
import { NaturalDropdownService } from './dropdown.service';
import { OverlayModule } from '@angular/cdk/overlay';

describe('DropdownService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [OverlayModule],
        });
    });

    it('should be created', inject([NaturalDropdownService], (service: NaturalDropdownService) => {
        expect(service).toBeTruthy();
    }));
});
