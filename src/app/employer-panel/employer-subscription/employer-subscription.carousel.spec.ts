import { discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { EmployerSubscriptionComponent } from './employer-subscription.component';

/**
 * WCAG 2.2.2 guard for the auto-advancing plan carousel: moving content needs a
 * way to pause it, and that pause must hold.
 *
 * The component is constructed directly rather than through TestBed. These specs
 * exercise the timer and pause state, not the template, and none of the injected
 * services are touched on these paths.
 */
describe('EmployerSubscriptionComponent -- carousel pause control (WCAG 2.2.2)', () => {

  function create(reducedMotion: boolean): { component: EmployerSubscriptionComponent; advance: jasmine.Spy } {
    spyOn(window, 'matchMedia').and.returnValue({ matches: reducedMotion } as unknown as MediaQueryList);
    const component = new EmployerSubscriptionComponent(
      {} as any, {} as any, {} as any, {} as any, {} as any, {} as any,
    );
    const advance = spyOn(component, 'advancePlanCarousel');
    return { component, advance };
  }

  function start(component: EmployerSubscriptionComponent): void {
    (component as any).startPlanCarouselAutoScroll();
  }

  it('advances on its own when nothing has paused it', fakeAsync(() => {
    const { component, advance } = create(false);
    start(component);
    tick(2000);
    expect(advance).toHaveBeenCalledTimes(1);
    discardPeriodicTasks();
  }));

  it('does not advance while the explicit pause is on', fakeAsync(() => {
    const { component, advance } = create(false);
    start(component);
    component.togglePlanCarouselAutoAdvance();
    tick(10000);
    expect(advance).not.toHaveBeenCalled();
    discardPeriodicTasks();
  }));

  it('resumes once the explicit pause is released', fakeAsync(() => {
    const { component, advance } = create(false);
    start(component);
    component.togglePlanCarouselAutoAdvance();
    component.togglePlanCarouselAutoAdvance();
    tick(2000);
    expect(advance).toHaveBeenCalledTimes(1);
    discardPeriodicTasks();
  }));

  it('keeps an explicit pause after a hover or touch ends', fakeAsync(() => {
    // The transient pause resumes itself 3s after an interaction ends. Before this
    // fix there was only that transient pause, so nothing could stop the rotation.
    const { component, advance } = create(false);
    start(component);
    component.togglePlanCarouselAutoAdvance();
    component.onPlanCarouselInteractionStart();
    component.onPlanCarouselInteractionEnd();
    tick(3000);
    tick(6000);
    expect(advance).not.toHaveBeenCalled();
    discardPeriodicTasks();
  }));

  it('offers the control only when the carousel is allowed to move', () => {
    const moving = create(false).component;
    expect(moving.planCarouselMotionAllowed).toBeTrue();
    (window.matchMedia as jasmine.Spy).and.returnValue({ matches: true } as unknown as MediaQueryList);
    expect(moving.planCarouselMotionAllowed).toBeFalse();
  });

  it('never starts rotating for a reduced-motion user', fakeAsync(() => {
    const { component, advance } = create(true);
    start(component);
    tick(10000);
    expect(advance).not.toHaveBeenCalled();
    discardPeriodicTasks();
  }));
});
