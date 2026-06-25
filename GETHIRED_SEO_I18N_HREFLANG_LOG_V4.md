# GetHired SEO V4 — i18n / hreflang Log

Generated: 2026-06-26

## Current i18n Setup

- Library: ngx-translate
- Languages: English (`en.json`), Vietnamese (`vie.json`) — both in `src/assets/i18n/`
- URL structure: Language-independent (no `/en/`, `/vi/` URL prefixes)
- Language switching: Client-side only, same URL serves all languages

## hreflang Decision

**Status: NOT IMPLEMENTED — correct decision maintained from V3**

### Why hreflang is NOT appropriate here

hreflang tells Google "this URL is the English version, this other URL is the Vietnamese version." It requires distinct URLs per language (e.g., `/en/jobs` and `/vi/jobs`).

GetHired uses the same URL for all languages — `/jobs` is both English and Vietnamese depending on the user's browser preference or in-app language switch. Adding hreflang in this case would be incorrect because:
1. There is no separate Vietnamese URL to point hreflang at
2. Pointing `hreflang="vi"` and `hreflang="en"` at the same URL is redundant and confusing for Google

**Correct approach:** Since the platform primarily targets the Philippines (primarily English/Filipino audience), and all job content is in English, no hreflang is needed.

## Content Language Assessment

- All job postings are in English (required by employers)
- Platform copy supports en and vie but the target market is primarily English-Filipino
- Google will detect the primary language from page content
- The `<html lang="en">` in index.html correctly declares English as the document language

## Vietnamese Content Gap

The `vie.json` translation file exists, which means the UI can be switched to Vietnamese. However:
- Job posting content remains in English regardless of UI language
- SEO descriptions/titles are all in English (hardcoded in components)
- There is no Vietnamese-specific SEO metadata

**Policy decision:** Do not add Vietnamese SEO metadata until:
1. There are distinct Vietnamese-language URLs (requires URL strategy change)
2. The content itself (job descriptions) is in Vietnamese

## Future hreflang Path

If the platform expands to serve a distinct Vietnamese-speaking market with separate URL paths:
1. Set up `/vi/` URL prefix in Angular routing (or separate subdomain `vi.gethiredonline.app`)
2. Add `<link rel="alternate" hreflang="vi" href="...">` tags
3. Use `x-default` to designate the English version as default

This is a significant architectural change — not a V5 item, but a future product decision.
