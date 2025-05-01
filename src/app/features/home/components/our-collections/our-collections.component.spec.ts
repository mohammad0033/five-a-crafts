import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurCollectionsComponent } from './our-collections.component';

describe('OurCollectionsComponent', () => {
  let component: OurCollectionsComponent;
  let fixture: ComponentFixture<OurCollectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurCollectionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
