import {inject, TestBed} from '@angular/core/testing';

import {NaturalFileService} from './file.service';

describe('NaturalFileService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({});
    });

    it('should be created', inject([NaturalFileService], (service: NaturalFileService) => {
        expect(service).toBeTruthy();
    }));
});
