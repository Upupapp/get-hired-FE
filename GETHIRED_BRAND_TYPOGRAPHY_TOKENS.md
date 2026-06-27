# GETHIRED BRAND — Typography & Design Token System (Phase 23)
**BRAND v6 · 2026-06-27**

---

## Baseline Inspection Results

### Font Configuration
- **Google Fonts (index.html, line 50):** Manrope (400, 500, 600, 700) + DM Sans + Poppins loaded
- **Local fonts (fonts.scss):** Circular-Regular, Circular-Book, Uni-Sans-Bold (legacy, not used in new components)
- **Global font-family (styles.scss, line 219):** `font-family: "Manrope", sans-serif` — applied to `*` and `body`
- **Confirmed brand font: Manrope** — already loaded, already set globally. No new font dependency needed.

### Existing SCSS Variables (colors.scss)
- All `$color-*` SCSS variables are preserved.
- CSS custom property equivalents added in `_tokens.scss` as `--gh-color-*`.
- No SCSS vars deleted or renamed.

### Existing SCSS Variables (_motion.scss)
- All `$motion-*`, `$gh-scale-*`, `$gh-shift-*`, `$gh-lift` SCSS variables preserved.
- CSS custom property equivalents added in `_motion.scss` under v6 additions as `--gh-motion-*`, `--gh-ease-*`, `--gh-scale-*`, `--gh-motion-shift-*`.

### Existing Token File
- No `_tokens.scss` existed before this pass. Created new.
- No `_variables.scss` exists in the project. No conflicts.

---

## Token File: `src/assets/styles/_tokens.scss`

**Status:** Created (BRAND v6, BRAND-V6-03).
**Import:** Added to `styles.scss` after `motion` import.
**Scope:** `:root` block — all tokens are CSS custom properties available globally.

---

## Typography Token Reference

### Font Family
```css
--gh-font-base: 'Manrope', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```
**Usage:** `font-family: var(--gh-font-base)` — or rely on global `*` rule in styles.scss (already set to Manrope).

### Font Weights
| Token | Value | Use |
|---|---|---|
| `--gh-weight-regular` | 400 | Body text, helper text, table cells |
| `--gh-weight-medium` | 500 | Nav labels, secondary info |
| `--gh-weight-semibold` | 600 | Card titles, badges, labels, button text |
| `--gh-weight-bold` | 700 | Page/section/display titles, KPI numbers, table headers |

### Type Scale
| Token (size) | Value | Line-height token | Weight token | Use |
|---|---|---|---|---|
| `--gh-text-display-size` | 36px | `--gh-text-display-lh: 44px` | 700 | Hero/display titles (public portal) |
| `--gh-text-page-size` | 28px | `--gh-text-page-lh: 36px` | 700 | Page H1 (authenticated pages) |
| `--gh-text-section-size` | 20px | `--gh-text-section-lh: 28px` | 700 | Section H2 headings |
| `--gh-text-card-size` | 16px | `--gh-text-card-lh: 24px` | 600 | Card titles |
| `--gh-text-body-size` | 14px | `--gh-text-body-lh: 22px` | 400 | Body text, descriptions |
| `--gh-text-helper-size` | 13px | `--gh-text-helper-lh: 20px` | 400 | Helper text, table cells |
| `--gh-text-label-size` | 12px | `--gh-text-label-lh: 16px` | 600 | Badges, micro labels, chips |
| `--gh-text-kpi-size` | 32px | `--gh-text-kpi-lh: 40px` | 700 | KPI numbers (dashboard) |
| `--gh-text-table-header-size` | 12px | `--gh-text-table-header-lh: 16px` | 700 | Table column headers |
| `--gh-text-table-cell-size` | 13px | `--gh-text-table-cell-lh: 20px` | 400 | Table cell content |

### Letter Spacing
| Token | Value | Use |
|---|---|---|
| `--gh-tracking-normal` | 0 | All body/paragraph text |
| `--gh-tracking-eyebrow` | 0.08em | Uppercase section eyebrows |
| `--gh-tracking-badge` | 0.02em | Badge/chip text |

---

## Spacing Scale Token Reference

| Token | Value | Use |
|---|---|---|
| `--gh-space-micro` | 4px | Icon+text in badges; tight gaps |
| `--gh-space-compact` | 8px | Chip padding; form helper text offset |
| `--gh-space-sm` | 12px | Sidebar nav vertical padding |
| `--gh-space-base` | 16px | Standard internal padding; sidebar horizontal |
| `--gh-space-card` | 20px | Card internal gap between elements |
| `--gh-space-section` | 24px | Between card groups in a panel |
| `--gh-space-major` | 32px | Between major page sections |
| `--gh-space-page` | 48px | Hero / page-level top padding |

---

## Component Sizing Token Reference

### Buttons
| Token | Value | Use |
|---|---|---|
| `--gh-btn-height` | 44px | Standard button (WCAG 2.5.5 minimum) |
| `--gh-btn-height-compact` | 36px | Compact table/row actions |
| `--gh-btn-height-large` | 48px | Large primary CTA |
| `--gh-btn-radius` | 10px | Standard button corners |
| `--gh-btn-radius-pill` | 9999px | Pill/outline button |
| `--gh-btn-font-size` | 14px | Button label |
| `--gh-btn-font-weight` | 600 | Button label weight |
| `--gh-btn-icon-gap` | 8px | Icon-to-label gap |

**Usage example (`.btn-primary`):**
```scss
.btn-primary {
  height: var(--gh-btn-height);
  border-radius: var(--gh-btn-radius);
  font-size: var(--gh-btn-font-size);
  font-weight: var(--gh-btn-font-weight);
}
```
Note: Existing `.btn-primary` in styles.scss uses `min-height: 44px` (correct); radius is `7px` (slightly below `--gh-btn-radius: 10px` — minor deviation, flagged as backlog BB-013).

### Sidebar
| Token | Value | Actual implementation |
|---|---|---|
| `--gh-sidebar-width` | 260px | `.gh-sidebar: width: 252px` — 8px under spec |
| `--gh-sidebar-logo-height` | 38px | `.gh-sidebar-logo-img: height: 38px` — MATCH |
| `--gh-sidebar-logo-max-width` | 180px | `.gh-sidebar-logo-img: max-width: 180px` — MATCH |
| `--gh-sidebar-nav-item-height` | 46px | `.gh-sidebar-item: padding 10px 12px` — computed ~42px with label; minor deviation |
| `--gh-sidebar-nav-label-size` | 14px | `.gh-sidebar-label: font-size: 13.5px` — minor deviation (BB-012) |
| `--gh-sidebar-nav-label-weight` | 500 | `.gh-sidebar-label: font-weight: 500` — MATCH |
| `--gh-sidebar-nav-icon-size` | 20px | `.gh-sidebar-icon: width: 22px` — minor deviation |
| `--gh-sidebar-nav-gap` | 12px | `.gh-sidebar-item: gap: 12px` — MATCH |
| `--gh-sidebar-padding` | 16px | `.gh-sidebar-item: padding: 10px 12px` — close |

### Cards
| Token | Value | Use |
|---|---|---|
| `--gh-card-radius` | 16px | Standard card |
| `--gh-card-radius-lg` | 24px | Dashboard hero card |
| `--gh-card-padding` | 20px | Standard card |
| `--gh-card-padding-lg` | 24px | Large card / hero |
| `--gh-card-shadow` | `0 2px 8px rgba(0,0,0,0.06)` | Soft shadow |

### Dashboard
| Token | Value | Use |
|---|---|---|
| `--gh-dash-hero-radius` | 22px | Dashboard hero section radius |
| `--gh-dash-hero-padding` | 28px | Dashboard hero padding |
| `--gh-kpi-card-height-min` | 96px | KPI card minimum height |
| `--gh-kpi-card-height-max` | 120px | KPI card max height |
| `--gh-action-card-height-min` | 120px | Action card minimum |
| `--gh-action-card-height-max` | 150px | Action card maximum |
| `--gh-insight-card-min-height` | 280px | Main insight / chart card |

### Forms
| Token | Value | Use |
|---|---|---|
| `--gh-input-height` | 44px | Form input height (WCAG 2.5.5) |
| `--gh-input-radius` | 10px | Input border radius |
| `--gh-input-font-size` | 14px | Input text |
| `--gh-label-font-size` | 13px | Form label |
| `--gh-label-font-weight` | 600 | Form label weight |
| `--gh-helper-font-size` | 12px | Helper / error text below input |

### Badges and Chips
| Token | Value | Use |
|---|---|---|
| `--gh-badge-height` | 26px | Badge height |
| `--gh-badge-radius` | 9999px | Pill shape |
| `--gh-badge-font-size` | 12px | Badge text |
| `--gh-badge-font-weight` | 600 | Badge text weight |
| `--gh-badge-padding` | `6px 10px` | Badge padding |
| `--gh-chip-icon-size` | 34px | Small icon chip |
| `--gh-chip-icon-size-lg` | 40px | Large icon chip |

### Icons
| Token | Value | Use |
|---|---|---|
| `--gh-icon-sm` | 16px | Inline / label icon |
| `--gh-icon-base` | 20px | Standard icon |
| `--gh-icon-lg` | 36px | Card icon (feature icon) |
| `--gh-icon-hero` | 56px | Decorative / empty state hero icon |

---

## Colour Token Reference

| Token | Value | Source SCSS var | Use |
|---|---|---|---|
| `--gh-color-primary` | #FF7062 | `$color-global-red-buttons` | CTAs, active states, accents |
| `--gh-color-primary-hover` | rgba(255,112,98,0.9) | — | Button hover |
| `--gh-color-primary-light` | rgba(255,112,98,0.1) | — | Tint backgrounds |
| `--gh-color-navy` | #1a1830 | `$gh-navy` (dashboard token) | Hero backgrounds |
| `--gh-color-navy-mid` | #2a2348 | `$gh-navy-mid` | Sidebar gradient |
| `--gh-color-purple` | #7c83fd | `$color-pipeline-accent` | Pipeline, analytics |
| `--gh-color-teal` | #2dd4bf | `$color-teal-accent` | Avatar gradient, success |
| `--gh-color-bg-page` | #f4f5f9 | `$gh-bg` (dashboard) | Page backgrounds |
| `--gh-color-bg-card` | #ffffff | — | Card backgrounds |
| `--gh-color-bg-sidebar` | #444152 | `$color-global-sidebar-employer-user-menu` | Employer sidebar |
| `--gh-color-text-primary` | #1a1830 | `$gh-text` | All body/heading text |
| `--gh-color-text-secondary` | #6b6887 | `$gh-muted` | Sub-labels, helper text |
| `--gh-color-text-muted` | rgba(255,255,255,0.6) | — | Text on dark backgrounds |
| `--gh-color-border-subtle` | #ebe7f5 | `$gh-border` | Card borders, dividers |
| `--gh-color-success` | #04A08B | `$color-green-secondary` | Success indicators |
| `--gh-color-success-dark` | #1A7A4A | — | Accessible success (4.85:1 vs white) |
| `--gh-color-warning` | #b45309 | `$color-warning-amber` | Warning states (5.02:1) |
| `--gh-color-error` | #C0392B | — | Error states (5.14:1 vs white) |
| `--gh-color-error-brand` | #FF7062 | `$color-global-red` | Brand accent only (NOT text on white — 3.1:1 fails WCAG AA) |
| `--gh-color-analytics` | #7c83fd | `$color-pipeline-accent` | Charts, analytics |

### Logo Tokens
| Token | Value | Use |
|---|---|---|
| `--gh-sidebar-logo-height` | 38px | Employer sidebar horizontal logo height |
| `--gh-sidebar-logo-max-width` | 180px | Max-width for horizontal logo |

**Logo file:** `src/assets/brand/Gethired-horizontal-logo.png`
**Rules:** Always `object-fit: contain`. Never stretch. Never use stacked version in employer sidebar. Height 36–44px range.

---

## Usage Examples Per Component Class

### Page title (`.gh-page-title`)
```scss
.gh-page-title {
  font-family: var(--gh-font-base);
  font-size: var(--gh-text-page-size);     // 28px
  line-height: var(--gh-text-page-lh);     // 36px
  font-weight: var(--gh-text-page-weight); // 700
  color: var(--gh-color-text-primary);
}
```

### Section title (`.gh-section-title`)
```scss
.gh-section-title {
  font-size: var(--gh-text-section-size);   // 20px
  line-height: var(--gh-text-section-lh);   // 28px
  font-weight: var(--gh-text-section-weight); // 700
  color: var(--gh-color-text-primary);
}
```

### KPI number (`.gh-kpi-number`)
```scss
.gh-kpi-number {
  font-size: var(--gh-text-kpi-size);     // 32px
  line-height: var(--gh-text-kpi-lh);    // 40px
  font-weight: var(--gh-text-kpi-weight); // 700
  color: var(--gh-color-text-primary);
}
```

### Badge / label (`.gh-badge`)
```scss
.gh-badge {
  height: var(--gh-badge-height);         // 26px
  padding: var(--gh-badge-padding);       // 6px 10px
  border-radius: var(--gh-badge-radius);  // pill
  font-size: var(--gh-badge-font-size);   // 12px
  font-weight: var(--gh-badge-font-weight); // 600
  letter-spacing: var(--gh-tracking-badge); // 0.02em
}
```

### Form input (`.form-control` — augment existing)
```scss
// Existing: has border, padding, font. Augment with token-aligned sizing:
.form-control {
  min-height: var(--gh-input-height);     // 44px
  border-radius: var(--gh-input-radius);  // 10px
  font-size: var(--gh-input-font-size);   // 14px
}
```

### Primary button (`.btn-primary` — augment existing)
```scss
// Existing min-height: 44px is correct. Token-align radius and font-weight:
.btn-primary {
  // min-height: 44px is already set
  border-radius: var(--gh-btn-radius);    // 10px (current: 7px — backlog BB-013)
  font-size: var(--gh-btn-font-size);     // 14px (already set)
  font-weight: var(--gh-btn-font-weight); // 600 (current: 500 — minor deviation)
}
```

### Employer sidebar logo (`.gh-sidebar-logo-img`)
```scss
// Already correct at 38px/180px per inspection.
.gh-sidebar-logo-img {
  height: var(--gh-sidebar-logo-height);        // 38px
  max-width: var(--gh-sidebar-logo-max-width);  // 180px
  object-fit: contain;
}
```

---

## Migration Notes

| Non-conforming screen | Deviation | Action |
|---|---|---|
| `.btn-primary` border-radius | 7px vs. 10px token | Backlog BB-013 — cosmetic; do not change without design approval |
| `.btn-primary` font-weight | 500 vs. 600 token | Backlog BB-013 — minor; defer |
| `.gh-sidebar-label` font-size | 13.5px vs. 14px | Backlog BB-012 |
| Sidebar width | 252px vs. 260px | Within acceptable range; token is aspirational target |
| Various page titles | Inconsistent | Backlog BB-013 — per-component fix needed |
| Various section titles | Inconsistent | Backlog BB-013 — per-component fix needed |
| KPI numbers | Dashboard uses 28px font in some KPI elements | Backlog BB-013 — should be 32px |

**Total type-scale deviations flagged as backlog: 4 categories** (page titles, section titles, KPI numbers, sidebar nav label).

---

## Reconciliation Notes

- **No SCSS variables deleted.** All existing `$color-*`, `$motion-*`, `$gh-*` SCSS variables preserved.
- **No CSS duplicates.** CSS custom properties use `--gh-` prefix; SCSS variables use `$` prefix — no namespace collision.
- **No component logic changed.** `_tokens.scss` is a pure CSS custom property declaration file.
- **Import order:** `colors` → `motion` → `tokens` — tokens are last so they can reference upstream concepts conceptually, even though CSS custom properties don't depend on SCSS compile order.
- **`_tokens.scss` does not `@import` colors.scss** — it uses hardcoded values that are aliased from known SCSS vars. This avoids circular import issues and makes the token file standalone-readable.
