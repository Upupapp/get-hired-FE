# GetHired SEO Audit — V4 Deployment (Recent 4 Commits)

**Audit date:** 2026-06-26
**Scope:** main-portal changes (commits 70bc592 / 172b2a9 / f9bc996) + status update (d3246b6)
**Auditor:** Claude Code SEO audit pass

---

## 1. Meta Tags Assessment

### Title
`GetHired Online — Jobs and Hiring Platform in the Philippines`
**Length:** 56 characters — PASS (optimal 50–60 char range).
**Assessment:** Well-formed. Contains brand name, primary action keywords, and geo-qualifier. No issues.

### Description
`Find jobs, build your profile, post jobs, and manage hiring with GetHired Online — the modern hiring platform for the Philippines.`
**Length:** 130 characters — CAUTION (optimal 150–160 chars; this is 20-30 chars short).
**Assessment:** The copy itself is good — clear, action-oriented, contains "Philippines" geo-signal. Length is slightly short, leaving room on SERP that competitors will fill. Not a blocking issue.
**Recommendation:** Consider extending to ~155 chars, e.g. appending ", for both job seekers and employers."

### Canonical
Set to: `https://gethiredonline.app/home`

**Route verification:** Confirmed correct.
- `app.routing.module.ts` line 25: `path: ''` → `redirectTo: '/home'`
- `public.module.ts` line 39–40: `{ path: '', redirectTo: 'home' }` then `{ path: 'home', component: MainPortalComponent }`

The canonical `/home` exactly matches the routed URL. PASS.

However, note: the root URL `/` redirects to `/home`. This means Google may see two URLs for the same page (`/` and `/home`). The canonical correctly points to `/home`, so `/` will be treated as a redirect duplicate — this is correct behavior. No action needed.

### Open Graph
- `og:url` uses canonical when provided (seo.service.ts line 96) — PASS
- `og:image` set to `DEFAULT_OG_IMAGE = /assets/brand/gethired-og-default.png` (1200×630) — PASS
- `og:image:width`, `og:image:height`, `og:image:type` all emitted (lines 103–107) — PASS
- `og:site_name` = "GetHired Online" — PASS

### Twitter Card
- `summary_large_image` default — PASS
- `twitter:image` emitted when ogImage present — PASS

---

## 2. JSON-LD Validity

### Organization JSON-LD (`gh-jsonld-org`)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GetHired Online",
  "url": "https://gethiredonline.app",
  "logo": "https://gethiredonline.app/assets/images/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "availableLanguage": ["English", "Filipino"]
  }
}
```
**Assessment:** Valid JSON-LD. All required @context/@type present. `logo` uses full absolute URL.
**Minor note:** Google's Rich Results Test prefers `logo` to be an `ImageObject` rather than a plain URL string. Current form is broadly valid but won't generate a logo rich result in Google Search. Not a blocking issue.
**Recommendation (optional):** Upgrade `logo` to `{ "@type": "ImageObject", "url": "...", "width": 192, "height": 192 }`.

### WebSite JSON-LD (`gh-jsonld-website`)
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "GetHired Online",
  "url": "https://gethiredonline.app",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://gethiredonline.app/jobs/search/{search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```
**Assessment:** Valid JSON-LD. SearchAction uses `EntryPoint` object form — this is the correct format per the updated Schema.org spec. `query-input` string is correct.
**Route check:** `/jobs/search/:keyword` is confirmed in `public.module.ts` line 43. PASS.

### JSON-LD injection mechanism
`setJsonLd()` uses `this.doc` (Angular's `DOCUMENT` token, not `window.document`). Per the V4 FIX comment at seo.service.ts line 201–208: previously guarded with `if (!this.isBrowser) return` which silently omitted JSON-LD from SSR output. The fix correctly uses injected DOCUMENT token so JSON-LD is in the server-rendered HTML Googlebot receives. PASS.

---

## 3. Heading Hierarchy

```
H1: "Find your next job. Build your next team."       (hero, line 8)
H2: "Not just a job board"                             (USP section, line 110)
H2: "What GetHired does"                               (differentiators, line 125)
H2: "For job seekers: build your profile once…"        (seeker journey, line 135)
H2: "For employers: post jobs and manage hiring…"      (employer journey, line 151)
H2: "See how GetHired works"                           (product preview, line 177)
H2: "Built for clearer, more organized hiring"         (trust section, line 384)
H2: "Ready to hire in the Philippines?"                (employer band, line 417)
H2: "Ready to get started?"                            (final CTA band — via portal-cta-band)
  H3: (USP cards: "Stronger profiles", "Video answers", etc.)
  H3: (Differentiator cards: "Structured profiles", "CV and resume support", etc.)
  H3: (Journey steps: "Create your profile", etc.)
  H3: (Tab panels: "One reusable profile", "Manage hiring in one workspace", etc.)
  H3: (Trust cards: "Guidance, not automatic decisions", etc.)
```

**Assessment:** PASS. One H1 at the top, then H2 for all major sections, H3 for card titles within sections. No heading levels are skipped. Hierarchy is clean.

---

## 4. SSR Compatibility

### SeoService — PASS
All three calls in `ngOnInit` (`setPageMeta`, `setOrganizationJsonLd`, `setWebsiteJsonLd`) use the injected `DOCUMENT` token (not `window` or `document` global). SSR-safe. V4 fixes this explicitly (see seo.service.ts lines 141–153, 200–216).

### Analytics calls in main-portal.component.ts — ISSUE FOUND
`PublicPortalAnalyticsService.track()` (analytics.service.ts line 22) calls `(window as any).gtag` with no `isPlatformBrowser` guard. The try/catch on line 26 will suppress the `ReferenceError` on Node.js if `window` is not defined at all, but on Angular Universal `window` is not defined in the global scope unless a polyfill is provided.

`trackHeroCTAClicked` and `trackFinalCTAClicked` are only called from button `(click)` handlers — which never fire during SSR (Angular Universal does not emit DOM events during `renderModule`). So **the analytics methods are not called during SSR in practice**, making this a non-blocking issue for current SEO.

However, the `isProd()` helper (line 30) also accesses `window`, with the same try/catch pattern. No actual SSR failure today, but fragile.
**Recommendation (non-blocking):** Add `if (!isPlatformBrowser(this.platformId)) return;` at the top of `track()` as a clean guard for when a real analytics SDK is wired in.

### `onTabKeydown` / `tablistRef` — PASS
`onTabKeydown` accesses `this.tablistRef.nativeElement` only when the method is invoked from a `(keydown)` DOM event (template line 181). This can only fire in the browser. `@ViewChild` returns undefined during SSR; the guard `if (this.tablistRef)` (component line 133) correctly prevents the nativeElement access on SSR. PASS.

### `coreService.isLoggedIn()` in ngOnInit — needs inspection note
The `ngOnInit` redirect logic (lines 101–109) calls `this.coreService.isLoggedIn()`. If that method accesses `localStorage` or `sessionStorage` without a browser guard, it will throw on SSR. This is pre-existing code (not in the recent 4 commits), so it is flagged as a follow-up rather than a release blocker for this deployment.

---

## 5. CTA Link vs Button Usage

**All CTAs on this page use `<button type="button" (click)="...">` — not `<a href>` elements.**

Inventory:
- Hero primary: `<button (click)="heroCTAFindJobs()">Find jobs</button>`
- Hero secondary: `<button (click)="heroCTAStartHiring()">Start hiring</button>`
- "Browse jobs without an account": `<button (click)="goToJobs()">`
- "Sign in": `<button (click)="goToSignin()">`
- Role cards: `<button (click)="onActivate()">` (role-card.component.html)
- Journey CTAs: `<button (click)="goToJobs()">`, `<button (click)="goToEmployerPortal()">`
- Tab panel CTAs: `<button (click)="goToJobSeekerPortal()">` etc.
- Final CTA band: `<button (click)="primaryClick.emit()">` (portal-cta-band.component.html)

**SEO impact:** Googlebot can follow JavaScript-rendered navigation in Angular SPAs and does index SPA content, but `<a href>` links pass PageRank directly and are more reliably crawled. None of these CTAs point to external resources — they all use Angular Router navigation internally. The pages they navigate to (`/jobs`, `/job-seekers`, `/employers`, `/signin`) are all reachable via their own routes.

**Assessment:** This is a medium-term SEO improvement opportunity, not a blocker. For the primary "Find jobs" and "Start hiring" CTAs in the hero, converting to `<a routerLink="/jobs">` and `<a routerLink="/employers">` would make the links crawlable as first-class hyperlinks and pass anchor text signals.

**Recommended fix (not applied — exceeds safe-only scope):**
```html
<!-- Hero: replace buttons with anchor tags -->
<a routerLink="/jobs" class="btn-cta-primary gh-pressable" (click)="heroCTAFindJobs()">Find jobs</a>
<a routerLink="/job-seekers" class="btn-cta-outline gh-pressable" (click)="heroCTAStartHiring()">Start hiring</a>
```
This pattern lets the analytics event still fire while providing a real href for crawlers.

---

## 6. Tab Panel Indexability

**All 5 product preview tabs use `*ngIf`** (main-portal.component.html lines 218, 257, 295, 330, 352):
```html
<ng-container *ngIf="activePreviewTab === 'seeker'">
<ng-container *ngIf="activePreviewTab === 'employer'">
<ng-container *ngIf="activePreviewTab === 'tracking'">
<ng-container *ngIf="activePreviewTab === 'video'">
<ng-container *ngIf="activePreviewTab === 'signals'">
```

`activePreviewTab` is initialized to `'seeker'` (component line 69). This means:
- **SSR output:** Only the "Job seeker profile" tab panel (`seeker`) is in the server-rendered HTML. The other 4 panels (employer, tracking, video, signals) are not in the DOM on initial load.
- **Googlebot sees:** Only the "seeker" tab content (H3 "One reusable profile", bullets about building a profile, CV uploads, video answers).
- **Content missed by crawlers:** H3 "Manage hiring in one workspace", H3 "Follow every application", H3 "Video answers, reviewed by people", H3 "Explainable signals, not hidden decisions" — and their bullet points.

**Assessment:** This is the most significant SEO issue in the page. Four of five tab sections are invisible to Google. The tab labels ("Employer dashboard", "Application tracking", "Video answers", "Compatibility signals") are in `<button>` elements in the tablist, so their text is indexable, but the richer H3 headings and bullet-point content are not.

**Options:**
1. **Switch to `[hidden]` / `[attr.hidden]`** — keeps all DOM in place, all content indexed. Recommended for SEO if the panels are small enough that DOM size is not a concern.
2. **Keep `*ngIf` but render all panels server-side** — requires SSR state initialization logic, more complex.
3. **Accept the tradeoff** — tab labels are indexable; the panel content is supplemental/illustrative.

**Recommended fix (safe, applies to template only):**
Replace `*ngIf="activePreviewTab === 'X'"` with `[hidden]="activePreviewTab !== 'X'"` on each `<div class="portal-preview-panel">`. The `<ng-container>` wrappers can be removed. This change is purely presentational and does not touch business logic.

---

## 7. Image Alt Text

| Image | Alt | Assessment |
|---|---|---|
| `portal-gradient-mesh.svg` | `""` + `aria-hidden="true"` | PASS — decorative |
| `gethired-connection-bridge.svg` | `""` + `aria-hidden="true"` | PASS — decorative |
| USP pillar icons (4) | `""` + `aria-hidden="true"` | PASS — icons with adjacent text labels |
| Hero mock cards | no `<img>` — pure CSS divs | N/A |
| Role card icons (2 PNGs) | `alt=""` in role-card.component.html | PASS — decorative within labelled button |
| `match-signal-rings.svg` in signals tab | `""` + `aria-hidden="true"` | PASS — decorative |

**Assessment:** PASS. Decorative images are correctly hidden with empty alt + aria-hidden. No content images are missing descriptive alt text.

---

## 8. Status Update Page (commit d3246b6)

The status update changes affect private employer portal pages (behind `AuthGuard`). These routes are not publicly crawlable. No SEO impact. PASS — no action needed.

---

## 9. Fixes Applied in This Audit

**None applied.** All findings are either PASS, advisory recommendations, or require non-trivial template changes that exceed the safe-only scope of this audit.

---

## 10. Prioritized Recommendations

| Priority | Finding | Action |
|---|---|---|
| P1 (medium SEO impact) | Tab panels 2–5 (`*ngIf`) invisible to Googlebot | Switch `*ngIf` to `[hidden]` on `.portal-preview-panel` divs |
| P2 (minor SEO lift) | Hero CTAs are `<button>` not `<a href>` | Convert hero "Find jobs" / "Start hiring" to `<a routerLink>` |
| P3 (minor) | Meta description is 130 chars (short by ~25 chars) | Extend description to ~155 chars |
| P4 (optional) | Organization `logo` is a string URL, not `ImageObject` | Wrap in `{ "@type": "ImageObject", "url": "...", ... }` |
| P5 (non-blocking) | `PublicPortalAnalyticsService.track()` lacks `isPlatformBrowser` guard | Add guard before `window` access |
| Follow-up (pre-existing) | `coreService.isLoggedIn()` in ngOnInit may access localStorage on SSR | Audit CoreService for SSR safety |

---

## Release Gate

**GO WITH CAUTION**

The V4 deployment is fundamentally sound for SEO:
- Meta tags, canonical, and JSON-LD are all correct and now properly emitted by SSR (the critical V4 fix).
- Heading hierarchy is clean (H1 → H2 → H3).
- No broken structured data.
- SSR safety is solid for the new code paths.

The one meaningful issue is the tab panel `*ngIf` pattern hiding 4 of 5 product preview sections from crawlers. This is illustrative/supplemental content — it will not hurt current rankings — but it represents a missed indexing opportunity for "Application tracking", "Video answers", and "Compatibility signals" keyword clusters. Fixing it (`[hidden]` swap) is low-risk and is the highest-value follow-up.
