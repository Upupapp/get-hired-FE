import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabSelectorsComponent } from './tab-selectors.component';

describe('TabSelectorsComponent', () => {
  let component: TabSelectorsComponent;
  let fixture: ComponentFixture<TabSelectorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabSelectorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabSelectorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
