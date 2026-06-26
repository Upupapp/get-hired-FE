# GETHIRED_DECISION_LOG_RECENT_V3
> Architecture and design decisions for homepage V2 deployment (commit e817e2e, 2026-06-26)
> Supersedes: prior V3 file (MOBILEVIEW V2 + SEO V3 scope — that content is preserved in session memory)

---

## DEC-HOME-01: "How it works" section removed

**Decision:** The "How it works" section that existed in the V1 homepage was removed entirely in V2.

**Rationale:** The "How it works" section was a 2-column list with step-by-step product usage instructions. The homepage already contained two complete journey sections — "For job seekers: build your profile once, apply with confidence" and "For employers: post jobs and manage hiring in one workspace" — each with numbered steps covering exactly the same ground. No information was present in "How it works" that was not already covered by these two journey sections in more detail and with better visual hierarchy. Keeping three representations of the same content made the page longer without adding value, created maintenance burden (three places to update when product flow changed), and broke the progressive disclosure principle (visitors saw what the product does before they were told how it works).

**Trade-off considered:** Some marketers prefer "How it works" as a quick-skim alternative to detailed journey sections. Rejected because the existing journey steps are already scannable (numbered list, h3 headings per step) and the additional section would have been redundant rather than complementary.

**Status:** Decided and shipped. The section will not be restored unless a distinct "quick skim" version with different content is designed.

---

## DEC-HOME-02: CSS-only mock panels in Product Preview (no live data)

**Decision:** All 5 Product Preview tab panels are pure CSS and hardcoded HTML — no Angular components with live data, no API calls, no `ngFor` over real records, no real user names or counts.

**Rationale:** The homepage is a public marketing page with anonymous visitors. Pulling live data into preview panels would require:
1. Public API endpoints that return aggregated/anonymized data (new backend work)
2. Error state handling if the API is down (preview broken for all visitors)
3. Privacy review of what "live" data is acceptable on a public marketing page
4. Loading state handling (skeleton or spinner during fetch)

None of these problems exist with static mocks. The section includes a visible disclaimer: "Illustrative view of key features." All mock names (Maria D., Juan P., ABC Company, XYZ Corp, Sunrise BPO) are clearly fictional generic placeholders that cannot be mistaken for real user profiles.

**Trade-off considered:** Live data would make the preview more compelling and feel more real. Rejected for V2 because the risk/complexity tradeoff is unfavorable for a marketing section. If live preview data is desired in future, it should be a dedicated backend project with its own anonymization and caching design.

**Status:** Decided and shipped. Mock-only panels are the permanent approach unless a future product decision changes this.

---

## DEC-HOME-03: 10% IntersectionObserver threshold for scroll reveal vs 40% for analytics

**Decision:** `PortalRevealDirective` uses a 10% intersection threshold (`{ threshold: 0.1 }`). The existing `ViewedOnceDirective` (used for analytics "section viewed" events elsewhere) uses 40% (`{ threshold: 0.4 }`).

**Rationale:** The two thresholds serve different purposes and the difference is intentional:

- **40% (ViewedOnce / analytics):** 40% visible means the visitor has genuinely seen a meaningful portion of the section. This threshold prevents a section that briefly entered the viewport while fast-scrolling from being counted as "viewed." It is correct for analytics intent measurement.

- **10% (PortalReveal / animation):** 10% visible is when the CSS reveal animation begins. If the animation starts at 40% visible, the element is already prominently in view before it starts fading in — the effect looks late and awkward. At 10%, the animation begins just as the element enters the viewport, giving the appearance of the section "arriving" as the user scrolls to it. This is the conventional scroll-reveal UX pattern.

The `(revealed)` event emitted by `PortalRevealDirective` piggybacks on the 10% threshold for analytics, which means analytics events fire slightly earlier than if they used `ViewedOnce`. This is an acceptable trade-off — the alternative (using both directives on every new section) would create two observers per element with different thresholds, which is more complex and the 10% vs 40% analytics difference is not meaningful.

**Status:** Decided and shipped.

---

## DEC-HOME-04: PortalRevealDirective as a new directive vs extending ViewedOnceDirective

**Decision:** `PortalRevealDirective` was created as a new, separate Angular directive rather than extending or modifying `ViewedOnceDirective`.

**Rationale:** The two directives have meaningfully different responsibilities:

| Concern | ViewedOnceDirective | PortalRevealDirective |
|---------|--------------------|-----------------------|
| Primary purpose | Analytics intent detection | Visual scroll reveal animation |
| CSS manipulation | None | Adds `is-revealed` class to host |
| Threshold | 40% | 10% |
| Observer lifetime | Disconnects after first fire | Disconnects after first fire |
| Event output | `(viewedOnce)` EventEmitter | `(revealed)` EventEmitter |
| SSR fallback | None needed (analytics-only) | Adds `is-revealed` immediately (content must be visible) |

Extending `ViewedOnceDirective` would have required either: (a) adding CSS manipulation responsibilities to an analytics-only directive (violates single responsibility), or (b) a complex subclass that overrides threshold and adds CSS logic while preserving analytics behavior. A new directive with a clear single purpose (`[appPortalReveal]` = make this element fade in on scroll) is simpler, more readable, and keeps `ViewedOnceDirective` untouched.

**Status:** Decided and shipped.

---

## DEC-HOME-05: Employer conversion band placed after Trust & Safety section

**Decision:** The Employer conversion band (mid-page employer CTA) is placed between the Trust & Safety section and the Final CTA band, not immediately after the employer journey section.

**Rationale:** At the scroll depth where the employer journey section ends, the employer visitor has just read a 6-step process list. The primary question in their mind at that point is "does this platform work the way they say it does?" The Trust & Safety section answers this directly: guidance not automatic decisions, human video review, no AI screening. After reading these four claims, the visitor's trust concern is addressed. The Employer conversion band appearing immediately after Trust answers the implicit question "so should I try it?" with "yes — and here's your entry point." This trust-then-action flow converts better than action-immediately-after-process because it addresses the employer's highest concern (trust in the platform's hiring ethics) before asking for commitment.

Placing the band immediately after the employer journey would have meant: visitor reads "here are the 6 steps" → immediately asked to "Start hiring." The trust question is still unresolved at that moment. The current placement: visitor reads journey → visitor reads trust claims → visitor is asked to act. The ask comes after trust is established.

**Status:** Decided and shipped.

---

## DEC-HOME-06: Hero CTA and final CTA click events defined but not wired to template

**Decision:** `trackHeroCTAClicked()` and `trackFinalCTAClicked()` were added to `PublicPortalAnalyticsService` as typed methods but are not called from any template.

**Rationale:** Two factors drove this:

1. **No analytics SDK exists.** All analytics calls are no-ops in production. Adding template bindings for events that silently do nothing in production adds template complexity with zero current benefit. The methods exist for when an SDK is wired (GH-HOME-006).

2. **Navigation simplicity.** The hero and final CTA buttons call `goToJobs()` and `goToEmployerPortal()` which use Angular Router's `navigateByUrl()` directly. Adding analytics calls would require either: (a) adding analytics calls inside these navigation methods (cleaner but means the same navigation method tracks differently depending on which button called it), or (b) creating button-specific wrapper methods (`goToJobsFromHero()` etc.) that add template verbosity.

The clean resolution is to wire these when GH-HOME-006 is done. At that point the SDK exists, the events are meaningful, and the wiring is worth the template change.

**Status:** Decided — events deferred to GH-HOME-003 (ready to execute after GH-HOME-006).

---

## DEC-HOME-07: TalentProofBadge used in three placements without hardcoding the count

**Decision:** The `app-talent-proof-badge` component is used in three placements on the homepage (hero, employer journey section, employer conversion band). The "500,000+" figure is never hardcoded anywhere in the homepage template or component.

**Rationale:** The 500K figure must come exclusively from `TalentProofService` so that: (a) when the count changes, one update in the service updates all three placements, and (b) the count can be verified or flagged as unverified by the service before display. Hardcoding "500,000+" in the homepage would create a maintenance liability — the figure would become stale independently, the badge component's formatting/styling would not apply, and the count cannot be remotely disabled if it becomes inaccurate.

This decision follows the standing rule documented in `GETHIRED_HOME_SECURITY_CLAIMS_AUDIT.md`: "500K claim via TalentProofService only."

**Status:** Decided and enforced. No `500,000` or `500K` string appears in `main-portal.component.html` or `main-portal.component.ts`.

---

## DEC-HOME-08: SSR-safe IntersectionObserver with content-always-visible fallback

**Decision:** `PortalRevealDirective` checks `isPlatformBrowser(platformId)` AND `typeof IntersectionObserver === 'undefined'` before creating an observer. If either check fails, it adds `is-revealed` immediately so the content is never permanently invisible.

**Rationale:** The homepage is rendered server-side (Angular Universal). On the server, `window`, `document`, and `IntersectionObserver` do not exist. Creating an observer in SSR would throw a runtime error. The `isPlatformBrowser` check prevents this.

The secondary check `typeof IntersectionObserver === 'undefined'` handles older browsers (IE 11, some older Safari versions) that do not support IntersectionObserver. Without this check, these browsers would show permanently invisible sections — users would see a page with blank gaps where the scroll-reveal sections should be.

The `opacity: 0` initial state in CSS does not hide content from search crawlers or screen readers — the SSR'd HTML contains the full text content regardless of CSS opacity. The `is-revealed` class is added client-side after hydration, so sections that are in the viewport on page load become visible quickly after JavaScript loads.

**Status:** Decided and shipped.
