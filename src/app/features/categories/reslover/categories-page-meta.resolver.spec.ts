import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { categoriesPageMetaResolver } from './categories-page-meta.resolver';

describe('categoriesPageMetaResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => categoriesPageMetaResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
