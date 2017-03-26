import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentRatingLoaderComponent } from './current-rating-loader.component';

describe('CurrentRatingLoaderComponent', () => {
  let component: CurrentRatingLoaderComponent;
  let fixture: ComponentFixture<CurrentRatingLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentRatingLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentRatingLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
