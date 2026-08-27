import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { configureComponentTestingModule } from '../testing/component-harness';

/**
 * Two of the three specs here were `ng new` scaffolding left over from a template
 * project called "my-pet-go": they asserted `app.title === 'my-pet-go'` and looked
 * for a `.content span` reading "my-pet-go app is running!". Neither ever described
 * this application -- the title is 'Get Hired' and app.component.html is a bare
 * <router-outlet>. They are corrected to assert what the component actually is
 * rather than deleted, so the file still covers bootstrap.
 */
describe('AppComponent', () => {
  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ AppComponent ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it(`has as title 'Get Hired'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.title).toEqual('Get Hired');
  });

  it('renders the router outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
