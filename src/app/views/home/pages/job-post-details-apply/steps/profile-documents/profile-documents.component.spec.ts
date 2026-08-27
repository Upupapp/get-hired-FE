import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileDocumentsComponent } from './profile-documents.component';
import { configureComponentTestingModule } from '../../../../../../../testing/component-harness';

describe('ProfileDocumentsComponent', () => {
  let component: ProfileDocumentsComponent;
  let fixture: ComponentFixture<ProfileDocumentsComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ ProfileDocumentsComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
