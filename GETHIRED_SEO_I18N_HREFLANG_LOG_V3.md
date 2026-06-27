# GETHIRED SEO i18n / Hreflang Log V3

Generated: 2026-06-25

## Decision: DO NOT implement hreflang

### Reason
GetHired uses ngx-translate for i18n (confirmed in `app.module.ts`, `app.component.ts`).
Language is switched via `translateService.use()` — the same URL (e.g., `/jobs`) is rendered in different languages based on the user's browser language or a stored preference (`selectedLang` in localStorage).

There are **no language-prefixed URL paths** (e.g., no `/en/jobs`, `/tl/jobs`, `/fil/jobs`).

**Rule:** hreflang requires different URLs per language. Using hreflang with the same URL for multiple languages is incorrect and would confuse Googlebot.

### ngx-translate Languages Found
In `app.component.ts`:
```typescript
this.translateService.use(
  selectedLang ? selectedLang : browserLang.match(/en|vie/) ? browserLang : 'en'
);
```
Supported languages: `en`, `vie` (Vietnamese). Default: `en`.

### Philippine Market Impact
The platform targets the Philippines. Filipino/Tagalog is not currently a supported ngx-translate language. English is the primary language.

If Tagalog is added in the future and served at different URLs (e.g., `/tl/`), hreflang should be implemented then.

## Recommendation
The current setup is correct from an SEO perspective. A single set of English URLs indexed by Google, with no hreflang. No action needed.

## Future Hreflang Implementation (if URL-based i18n is ever adopted)
If the app moves to URL-based language switching:
1. Add language prefix to routing: `/en/jobs`, `/tl/jobs`.
2. Add hreflang in SeoService via `Meta` service:
   ```typescript
   this.meta.addTag({ rel: 'alternate', hreflang: 'en', href: 'https://gethiredonline.app/en/jobs' });
   this.meta.addTag({ rel: 'alternate', hreflang: 'tl', href: 'https://gethiredonline.app/tl/jobs' });
   this.meta.addTag({ rel: 'alternate', hreflang: 'x-default', href: 'https://gethiredonline.app/en/jobs' });
   ```
3. Also add these in the XML sitemap with `<xhtml:link>` elements.
