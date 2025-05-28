import { TestBed } from '@angular/core/testing';

import { RecentlyViewedService } from './recently-viewed.service';

describe('RecentlyViewedService', () => {
  let service: RecentlyViewedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecentlyViewedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
