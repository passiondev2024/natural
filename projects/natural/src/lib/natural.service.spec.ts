import { TestBed } from '@angular/core/testing';

import { NaturalService } from './natural.service';

describe('NaturalService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NaturalService = TestBed.get(NaturalService);
    expect(service).toBeTruthy();
  });
});
