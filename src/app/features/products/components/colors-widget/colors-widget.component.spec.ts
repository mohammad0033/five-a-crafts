import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorsWidgetComponent } from './colors-widget.component';

describe('ColorsWidgetComponent', () => {
  let component: ColorsWidgetComponent;
  let fixture: ComponentFixture<ColorsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorsWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColorsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
