import { TestBed } from '@angular/core/testing';

import { PiiService } from './pii.service';

describe('PiiService', () => {
  let service: PiiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PiiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
