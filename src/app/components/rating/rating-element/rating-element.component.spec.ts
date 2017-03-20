import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingElementComponent } from './rating-element.component';

describe('RatingElementComponent', () => {
  let component: RatingElementComponent;
  let fixture: ComponentFixture<RatingElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatingElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
