import { TestBed } from '@angular/core/testing';

import { ContentApiService } from './content-api.service';

describe('ContentService', () => {
  let service: ContentApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContentApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
