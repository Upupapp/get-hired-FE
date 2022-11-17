import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptySectionComponent } from './empty-section.component';

describe('EmptySectionComponent', () => {
  let component: EmptySectionComponent;
  let fixture: ComponentFixture<EmptySectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmptySectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmptySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
