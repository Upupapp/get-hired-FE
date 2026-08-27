import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomProfileLoaderComponent } from './custom-profile-loader.component';
import { configureComponentTestingModule } from '../../../../testing/component-harness';

describe('CustomProfileLoaderComponent', () => {
  let component: CustomProfileLoaderComponent;
  let fixture: ComponentFixture<CustomProfileLoaderComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ CustomProfileLoaderComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomProfileLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
