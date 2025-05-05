import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesRowComponent } from './categories-row.component';

describe('HomeCategoriesRowComponent', () => {
  let component: CategoriesRowComponent;
  let fixture: ComponentFixture<CategoriesRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
