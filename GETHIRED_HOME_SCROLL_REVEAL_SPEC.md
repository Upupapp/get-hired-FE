# GETHIRED_HOME_SCROLL_REVEAL_SPEC
> Scroll reveal implementation for GETHIRED_HOME_INFORMATION_PORTAL_REDESIGN_RESEARCH_EXPANDED_V2

## Directive: PortalRevealDirective
- **Selector:** `[appPortalReveal]`
- **File:** `src/app/shared/directives/portal-reveal.directive.ts`
- **Registered in:** `src/app/shared/shared.module.ts`

## Behavior
1. On `ngOnInit`, checks `isPlatformBrowser(platformId)` AND `typeof IntersectionObserver !== 'undefined'`
2. If SSR or no IntersectionObserver support: adds `is-revealed` class immediately (content is never permanently hidden)
3. Otherwise: creates an `IntersectionObserver` with `threshold: 0.1`
4. When 10% of the element is visible: adds `is-revealed` class, emits `(revealed)` event, disconnects observer
5. On `ngOnDestroy`: disconnects observer and nulls the reference

## CSS classes
- **`.portal-reveal-section`** — applied to host elements in HTML; sets initial hidden state
- **`.is-revealed`** — added by directive at reveal time; triggers CSS transition to visible state

## CSS implementation (in `main-portal.component.scss`)
```scss
.portal-reveal-section {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 500ms cubic-bezier(0.0, 0.0, 0.2, 1),
              transform 500ms cubic-bezier(0.0, 0.0, 0.2, 1);

  &.is-revealed {
    opacity: 1;
    transform: none;
  }

  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

## Sections using scroll reveal

| Section | Reveal event |
|---------|-------------|
| Product Preview | `onProductPreviewViewed()` → analytics |
| Trust & Safety | `onTrustSectionViewed()` → analytics |
| Employer conversion band | `onEmployerBandViewed()` → analytics |

## Sections NOT using scroll reveal (above fold / established sections)

Hero, role selector, USP pillars, bento grid, journey sections, and final CTA band are unaffected by this directive. The hero has its own CSS animations; other sections load visible by default.

## SSR / Angular Universal compatibility
- `isPlatformBrowser` check prevents `IntersectionObserver` instantiation on the server
- Elements start with `opacity: 0` in the SSR'd HTML (CSS is inline in the Angular build)
- After hydration, observers are set up; elements already in viewport get `is-revealed` quickly
- For screen readers and search crawlers: the text content is present in the SSR HTML regardless of opacity
- `prefers-reduced-motion: reduce` users: all reveals are immediate (opacity 1, no transform, no transition)
