import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicSearchComponent } from './public-search.component';
import { configureComponentTestingModule } from '../../../testing/component-harness';

describe('PublicSearchComponent', () => {
  let component: PublicSearchComponent;
  let fixture: ComponentFixture<PublicSearchComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ PublicSearchComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
