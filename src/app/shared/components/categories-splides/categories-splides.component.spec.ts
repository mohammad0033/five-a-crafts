import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesSplidesComponent } from './categories-splides.component';

describe('CategoriesSplidesComponent', () => {
  let component: CategoriesSplidesComponent;
  let fixture: ComponentFixture<CategoriesSplidesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesSplidesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesSplidesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
