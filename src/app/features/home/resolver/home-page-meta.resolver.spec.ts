import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { homePageMetaResolver } from './home-page-meta.resolver';

describe('homePageMetaResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => homePageMetaResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
