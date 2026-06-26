# GETHIRED SEO REPORT — RECENT DEPLOYMENT V6
Generated: 2026-06-26
Scope: Homepage V2 (commit e817e2e) — 3 new sections + hero proof chips + "How it works" removal
Files reviewed: main-portal.component.html, main-portal.component.ts, seo.service.ts

---

## 1. CRAWLABILITY OF NEW SECTIONS

All three new sections are rendered inside the Angular Universal SSR path (`ngOnInit` runs on the
server). Googlebot receives the full HTML of every section on first fetch — no JavaScript execution
required to see the content.

### Product Preview section (`portal-product-preview`)

Tab panels use `*ngIf="activePreviewTab === '<tab>'"`. The component initialises
`activePreviewTab = 'seeker'`, so at SSR time only the **seeker** panel renders into HTML.

| Tab | SSR-visible? | Crawlable? |
|-----|-------------|------------|
| Job seeker profile (seeker) | YES — default value | YES |
| Employer dashboard (employer) | No | No |
| Application tracking (tracking) | No | No |
| Video answers (video) | No | No |
| Compatibility signals (signals) | No | No |

**Assessment:** Acceptable. The four hidden panels contain illustrative marketing copy that is
already covered by headings and prose elsewhere on the page (USP section, differentiators section,
journey sections). No unique page-level keywords are locked exclusively inside the hidden tabs.
The tab button labels ("Employer dashboard", "Application tracking", "Video answers",
"Compatibility signals") ARE in the SSR HTML as `<button>` text — crawlable, though lower weight
than heading text.

The seeker panel's visible `<h3>One reusable profile</h3>` plus its list items ARE crawlable.

### Trust & Safety section (`portal-trust-safety`)

All 4 cards are in static HTML with no conditional rendering. Fully crawlable. Each card has an
`<h3>` and a `<p>` — semantic structure is sound.

### Employer conversion band (`portal-employer-band`)

Static HTML. Heading and body copy are fully crawlable.

---

## 2. HEADING HIERARCHY

Full heading order as rendered (SSR output):

```
H1: "Find your next job. Build your next team."  (hero)
H2: "Not just a job board"  (USP section)
  H3: [uspPillars titles — 4 items]  (USP cards)
H2: "What GetHired does"  (differentiators)
  H3: [differentiators titles — 6 items]  (bento cards)
H2: "For job seekers: build your profile once, apply with confidence."  (journey — seeker)
  H3: [jobSeekerJourney titles — 5 items]  (journey steps)
H2: "For employers: post jobs and manage hiring in one workspace."  (journey — employer)
  H3: [employerJourney titles — 6 items]  (journey steps)
H2: "See how GetHired works"  (product preview — NEW)
  H3: "One reusable profile"  (seeker panel — SSR-visible only)
H2: "Built for clearer, more organized hiring"  (trust & safety — NEW)
  H3: "Guidance, not automatic decisions"  (trust card 1 — NEW)
  H3: "Video answers reviewed by real people"  (trust card 2 — NEW)
  H3: "Structured data, clearer review"  (trust card 3 — NEW)
  H3: "Built for Philippine hiring"  (trust card 4 — NEW)
H2: "Ready to hire in the Philippines?"  (employer band — NEW)
  [no H3 — band has heading + body only]
```

Hierarchy is correct and consistent throughout. H1 is unique. All new H2s are section-level titles.
All new H3s are card/panel-level titles within their H2 sections. No skipped heading levels. No
duplicate H1. The employer band has an H2 with no H3 children — this is acceptable since it is a
conversion CTA block, not a content section requiring sub-headings.

One minor note: `portal-section-title` is the shared class for H2s. The employer band uses a
separate class `portal-employer-band-title` on its H2 — semantically identical, just a different
CSS class. No SEO concern.

---

## 3. META TAGS IMPACT

All meta tags are set in `ngOnInit` via `SeoService.setPageMeta()`. None were changed by this
deployment.

| Tag | Value | Changed? |
|-----|-------|---------|
| `<title>` | "GetHired Online — Jobs and Hiring Platform in the Philippines" | No |
| `meta[description]` | "Find jobs, build your profile, post jobs, and manage hiring with GetHired Online — the modern hiring platform for the Philippines." | No |
| `link[rel=canonical]` | `https://gethiredonline.app/home` | No |
| `meta[robots]` | `index, follow` | No |
| `og:image` | `/assets/brand/gethired-og-default.png` | No |
| JSON-LD | Organization + WebSite (with SearchAction) | No |

No meta regression from this deployment.

**Keyword density added by new sections:**

The new body copy adds meaningful in-page keyword coverage for terms the meta description already
signals:

| Keyword / phrase | New section(s) containing it |
|-----------------|------------------------------|
| "job seekers" | trust band heading, trust card 4 |
| "employers" | trust card 4, employer band heading |
| "Philippines" / "Philippine" | trust card 4 ("Philippine job market"), employer band H2 ("hire in the Philippines"), employer band body ("GetHired") |
| "structured profiles" | trust card 3 ("Organized profiles, CVs") |
| "video answers" | trust card H3 ("Video answers reviewed by real people"), trust card body, product preview section H2 (via button labels) |
| "hiring" | trust section H2, trust card 3, employer band H2 and body |
| "compatibility signals" | product preview tab button text, signals panel (JS-only but button is crawlable) |
| "human judgment" | trust section subtitle: "not replace human judgment" |
| "fair hiring" | Not used verbatim; the trust section conveys the concept via "Guidance, not automatic decisions" and "human judgment" — semantic signal is present |

Assessment: The new sections meaningfully reinforce the page's keyword theme without stuffing.
The Trust & Safety section in particular adds natural supporting text around key differentiators.

---

## 4. STRUCTURED DATA

No structured data changes were introduced by this deployment.

- `Organization` JSON-LD: unchanged, still injected via `setOrganizationJsonLd()`
- `WebSite` JSON-LD with SearchAction: unchanged
- `JobPosting` JSON-LD: only injected on job detail pages, not the homepage

No new structured data is needed for the three new sections. They are marketing/informational
content — not job listings, FAQs, or events that Schema.org has specific types for.

**Opportunity (optional, not blocking):** The Trust & Safety section's 4 cards could be
represented as a `FAQPage` structured data block if framed as Q&A. However, the current copy is
declarative, not question-and-answer format, so this would require copy changes. Not recommended
without a content decision.

---

## 5. IMAGE SEO

### New images introduced by the deployment

| Image | Element | alt attribute | aria-hidden | loading | Assessment |
|-------|---------|--------------|------------|---------|-----------|
| `match-signal-rings.svg` (signals panel) | `<img>` | `alt=""` | `aria-hidden="true"` | `loading="lazy"` | Correct — decorative |

### Pre-existing images confirmed still correct

| Image | alt | aria-hidden | loading |
|-------|-----|------------|---------|
| `portal-gradient-mesh.svg` (hero) | `alt=""` | `aria-hidden="true"` | `loading="lazy"` |
| `gethired-connection-bridge.svg` (USP) | `alt=""` | `aria-hidden="true"` | `loading="lazy"` |
| USP pillar icons (4x) | `alt=""` | `aria-hidden="true"` | `loading="lazy"` |

The Trust & Safety section uses emoji characters (`🛡️`, `👥`, `📋`, `🇵🇭`) rendered as `<span
aria-hidden="true">` inside the cards. No `<img>` tags. No alt issues here.

The Product Preview section (non-signals tabs) uses CSS mock-card UI with no real `<img>` tags
except the signals panel. All correct.

No missing alt attributes found.

---

## 6. REMOVED CONTENT — "HOW IT WORKS" SECTION

The "How it works" section was removed. Based on the current template there is no such section
remaining — the content it covered (the two-column list format with ~16 words) has been superseded
by the more detailed `portal-journey` sections for job seekers (5 steps) and employers (6 steps),
which already existed in prior versions.

**Keyword loss assessment:** Minimal. The journey sections cover every concept the old "How it
works" section would have addressed, and with significantly more content. The removal does not
create a keyword gap.

---

## 7. INTERNAL LINKING

New sections add the following internal links (via Angular router navigation, which renders as
standard `<button>` click handlers — these are NOT `<a>` tags and are therefore NOT crawlable as
hyperlinks by Googlebot):

| CTA | Target route | Section |
|-----|-------------|---------|
| "Build your profile" | `/job-seekers` | Product Preview — seeker panel |
| "Start hiring" (x2) | `/employers` | Product Preview — employer panel (JS-only), Employer band |
| "Find jobs" (x2) | `/jobs` | Product Preview — tracking panel (JS-only), seeker panel |
| "See job seeker features" | `/job-seekers` | Product Preview — video panel (JS-only) |
| "See employer features" | `/employers` | Product Preview — signals panel (JS-only) |

**Assessment:** Because the CTAs use `<button (click)="router.navigateByUrl()"` rather than
`<a href="...">` elements, Googlebot does not follow these as crawl links. This is the same
pattern used throughout the existing page (hero CTAs, role card CTAs, etc.) and is not a
regression — it was pre-existing. The seeker panel CTA is in SSR HTML but still a `<button>`, not
an `<a>`.

The `portal-role-card` component (pre-existing, earlier on the page) renders "Continue as Job
Seeker" and "Continue as Employer" — these also use button-click navigation.

**Minor opportunity:** If `/job-seekers` and `/employers` are important SEO landing pages, adding
`<a>` link wrappers or using `routerLink` on anchor elements would strengthen crawl graph. This is
an existing gap, not introduced by this deployment.

---

## 8. PAGE WEIGHT AND CLS IMPACT

- `appPortalReveal` directive uses `opacity: 0` via CSS class transitions, not `display: none`.
  Content is in the DOM and in the SSR HTML at full layout size — no CLS impact, no crawl barrier.
- All three new sections contribute layout height from the start (no deferred layout shifts).
- The Product Preview tabbed interface switches panels via `*ngIf`, but the surrounding section
  container occupies constant height — no CLS from tab switching.
- No new third-party scripts introduced.
- No new external font loads.

---

## SUMMARY

The homepage V2 deployment is an SEO net positive. The three new sections add keyword-rich,
semantically structured content that reinforces the page's core topic without diluting it. The
heading hierarchy is clean. All images have correct alt handling. Meta tags are unchanged. The
only limitation worth noting is that 4 of 5 product preview tab panels are not in the initial SSR
HTML — this is acceptable given the content is supplementary and covered elsewhere.
