import { OverlayModule } from '@angular/cdk/overlay';
import { inject, TestBed } from '@angular/core/testing';
import { NaturalDropdownService } from './dropdown.service';

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
