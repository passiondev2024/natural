import {TestBed} from '@angular/core/testing';
import {NaturalFileService} from './file.service';

describe('NaturalFileService', () => {
    let service: NaturalFileService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(NaturalFileService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
