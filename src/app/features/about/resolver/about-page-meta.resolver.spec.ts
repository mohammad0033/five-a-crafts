import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { aboutPageMetaResolver } from './about-page-meta.resolver';

describe('aboutPageMetaResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => aboutPageMetaResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
