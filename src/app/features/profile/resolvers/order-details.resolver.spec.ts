import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { orderDetailsResolver } from './order-details.resolver';

describe('orderDetailsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => orderDetailsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
