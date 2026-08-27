import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreUsersComponent } from './explore-users.component';
import { configureComponentTestingModule } from '../../../../../../../testing/component-harness';

describe('ExploreUsersComponent', () => {
  let component: ExploreUsersComponent;
  let fixture: ComponentFixture<ExploreUsersComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ ExploreUsersComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
