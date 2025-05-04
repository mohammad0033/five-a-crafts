import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { contactPageMetaResolver } from './contact-page-meta.resolver';

describe('contactPageMetaResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => contactPageMetaResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
