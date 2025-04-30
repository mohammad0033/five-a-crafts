import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeCategoriesRowComponent } from './home-categories-row.component';

describe('HomeCategoriesRowComponent', () => {
  let component: HomeCategoriesRowComponent;
  let fixture: ComponentFixture<HomeCategoriesRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeCategoriesRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeCategoriesRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
