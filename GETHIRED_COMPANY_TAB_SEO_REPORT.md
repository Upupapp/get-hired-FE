# GETHIRED COMPANY TAB — SEO REPORT
**Scope:** Employer Portal › Company Tab (private employer-facing + public company profile impact)
**Date:** 2026-06-26

---

## SEO Context

The Company Tab is private (behind auth) so it has no direct SEO impact. However, the data entered here powers the **public company profile page** (`/company/details?id=...`) and the **company trust signals on public job cards**. Poor data here = weaker public SEO.

---

## Public-Facing Impact of Company Tab Fields

| Company Tab Field | Powers Public Page | SEO Impact |
|---|---|---|
| `companyName` | Job card + company page `<title>` | High — indexed company name |
| `companyDetails` | Company page description | High — indexed content, meta description source |
| `companyLogoUrl` | Job card logo, company page | Medium — image alt text |
| `industryId` | Company page category | Medium — topic classification |
| `companyAddress` + `companyCity` | Company page, structured data | Medium — local SEO |
| `numberOfEmployee` | Company page trust signal | Low |
| `workSetupId` | Company page + job card filter | Low |
| `shownPublicly` | Controls whether address shows | Low |

---

## Public Company Page SEO Audit

### S-01 — No OpenGraph Tags on /company/details
**Status:** Not verified from this pass — needs `banner-details.component.html` inspection
**Risk:** Company pages shared on social media show no preview image/title/description

### S-02 — No structured data (Organization schema) on company page
**Status:** Open
**Issue:** Public company page should include `Organization` JSON-LD:
```json
{
  "@type": "Organization",
  "name": "Nexora Digital Solutions",
  "description": "...",
  "address": { "@type": "PostalAddress", "addressLocality": "Makati" },
  "numberOfEmployees": { "@type": "QuantitativeValue", "value": 50 }
}
```
This directly improves Google Knowledge Panel eligibility.

### S-03 — `companyDetails` Placeholder Was Boilerplate Legal Text
**Status:** Fixed this session — new placeholder gives correct guidance
**Impact:** Recruiters were more likely to paste generic text, weakening indexed content

### S-04 — Company Logo `alt` Attribute
**Status:** `employer-company.component.html` line 86: `[alt]="company.companyName + ' logo'"` ✅ Correct

### S-05 — `/company/details` Public Route Has No `<title>` or `<meta description>`
**Status:** Needs `SeoService.setPageMeta()` call in `company-details.component.ts`
**Risk:** Public company pages get generic tab title, reducing click-through from search results

---

## Recommendations

| Priority | Action |
|---|---|
| High | Add `SeoService.setPageMeta({ title: companyName + ' — GetHired', description: companyDetails.substring(0,160) })` in `company-details.component.ts` |
| High | Add Organization JSON-LD structured data to public company page |
| Medium | Add OpenGraph `og:title`, `og:description`, `og:image` (logo URL) to company page |
| Low | Add `canonical` URL to company page (prevents duplicate via different param formats) |

---

## Character Limit Impact on SEO

The `maxlength="1000"` added this session does not affect SEO. Google indexes up to ~300 words of page text regardless. Meta description truncates at 160 chars — `SeoService` should use `companyDetails.substring(0, 155) + '...'`.
