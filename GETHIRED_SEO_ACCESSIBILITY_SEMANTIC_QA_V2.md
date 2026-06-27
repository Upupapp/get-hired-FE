# GETHIRED_SEO_ACCESSIBILITY_SEMANTIC_QA_V2
Command: GETHIRED_REUSABLE_SEO_SEARCH_INDEXING_PUBLIC_DISCOVERY_COMMAND_V2
Date: 2026-06-27

---

## Relationship Between Accessibility and SEO

Semantic HTML directly affects SEO. Google's crawler treats page headings, landmark regions, link text, and image alt text as content signals. Poor semantics = poor indexability.

---

## Semantic Structure Audit — Public Pages

### Verified Present

| Element | Status | Notes |
|---|---|---|
| `<html lang="en">` | ✅ | Set in index.html |
| `<title>` per route | ✅ | Dynamic via SeoService |
| `<meta name="description">` | ✅ | Dynamic per route |
| `<meta charset="UTF-8">` | ✅ | In index.html |
| `<meta name="viewport">` | ✅ | In index.html |

### Not Fully Audited (Require Component-Level Read)

The following were not component-level read during this session. These are standard audit items for a full accessibility pass:

| Check | Risk if Missing |
|---|---|
| `<h1>` present and unique per page | Googlebot uses H1 as primary content signal |
| H1/H2/H3 hierarchy (not skipping levels) | Confuses screen readers + crawler content hierarchy |
| `alt=""` on all `<img>` tags | Missing alt = uncrawlable image content |
| Link text is descriptive (not "click here") | Anchor text = ranking signal |
| Buttons have visible labels (not icon-only without aria-label) | Not crawlable; a11y violation |
| Form inputs have associated `<label>` elements | Screen reader compliance |

---

## Breadcrumb Navigation

BreadcrumbList JSON-LD is implemented on all public pages — this aids both accessibility (navigation context) and SEO (breadcrumb display in SERPs).

**Status:** ✅ Verified from audit.

---

## Image Alt Text on Public Pages

Job cards and company cards include images (company logos, job thumbnails). These should have:
- `alt="[Company Name] logo"` for company logos
- `alt=""` for purely decorative images

**Status:** Not verified at component level. This is a backlog item for a full a11y sweep.

---

## ARIA Roles on Public Components

Angular Material components handle most ARIA automatically. Custom components (job cards, filter panels, search inputs on `/jobs`) should be verified for:
- `role="search"` on the search bar
- `aria-label` on icon-only buttons
- `aria-live` on dynamically updating job count/filter results

**Status:** Not verified. Backlog.

---

## Color Contrast (WCAG AA)

The GetHired design system uses `#1a1830` (near-black) on `#fff` (white) backgrounds. This passes WCAG AA at all text sizes.

Muted gray text (`#6b6887`) on white: contrast ratio ~4.6:1 — passes AA at normal text size.
Red buttons (`rgb(255,112,98)`): text on colored background should be verified.

**Status:** Primary text passes. Colored button text is a manual verification item.

---

## Canonical and Duplicate Content

Canonical links remove duplicate content penalties for:
- `/` redirecting to `/home` (canonical points to `/home`)
- `/jobs/search/:keyword` canonical pointing to `/jobs`
- Any paginated job board views

**Status:** ✅ Implemented via SeoService `setCanonical()`.

---

## No Code Changes Made

This is an audit-only log. All accessibility improvements are backlog items. No code was written.
