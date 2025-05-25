import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { productsPageMetaResolver } from './products-page-meta.resolver';

describe('productsPageMetaResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => productsPageMetaResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
