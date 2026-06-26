# GETHIRED OPTIMIZE FIX LOG — RECENT DEPLOYMENT (V3)
Scope: commit e817e2e (homepage V2) — 6 FE files changed, BE untouched
Date: 2026-06-26

---

## Fixes Applied

| ID | File | Issue | Fix Applied | Why Safe | Risk |
|----|------|-------|-------------|----------|------|
| OPT-R01 | main-portal.component.html line 115 | img [src]="item.icon" inside *ngFor missing loading="lazy" (4 USP pillar icons, all below fold) | Added loading="lazy" to the img tag | Purely additive HTML attribute; browsers that do not support it ignore it safely. No visual change. | None |
| OPT-R02 | main-portal.component.html line 25 | heroProofChips *ngFor missing trackBy | Added trackBy: trackByIndex | trackByIndex returns index; array is static and never mutated. No DOM change on stable data. | None |
| OPT-R03 | main-portal.component.html line 114 | uspPillars *ngFor missing trackBy | Added trackBy: trackByIndex | Same as OPT-R02. Static array. | None |
| OPT-R04 | main-portal.component.html line 125 | differentiators *ngFor missing trackBy | Added trackBy: trackByIndex | Same as OPT-R02. Static array. | None |
| OPT-R05 | main-portal.component.html line 136 | jobSeekerJourney *ngFor missing trackBy | Added trackBy: trackByIndex | Same as OPT-R02. Static array. | None |
| OPT-R06 | main-portal.component.html line 152 | employerJourney *ngFor missing trackBy | Added trackBy: trackByIndex | Same as OPT-R02. Static array. | None |
| OPT-R07 | main-portal.component.ts | trackByIndex helper method added | Added trackByIndex(index: number): number { return index; } at end of class, before closing brace | Purely additive method; no change to existing logic, constructor, or template bindings. | None |

---

## Fixes Deferred

None. All identified issues were safe to fix inline.

---

## Items Assessed But Not Changed

| Item | Assessment | Decision |
|------|------------|----------|
| Tab button transitions (border-color, color, background, box-shadow) | Not GPU-composited, but on small interactive elements only. Industry-standard pattern. | No change — acceptable on tab-sized targets |
| portal-hero-glow filter: blur(60px) | CSS blur on pseudo-elements is GPU-accelerated in modern browsers. aria-hidden, pointer-events: none. | No change |
| portal-final-cta-glow filter: blur(40px) | Same as above — decorative, aria-hidden, pointer-events: none. | No change |
| backdrop-filter: blur(4px) on .portal-hero-chip | Applied to 4 small chip elements in the hero. Modern browser support is broad. No stacking-context issues observed. | No change — acceptable |
| style="width: 82%" inline style on .preview-completeness-fill | Static illustrative value (not data-driven), hardcoded in template. No computation on each render. | No change — not a performance concern |
| SCSS .portal-how-it-works block (lines 413-459) | Dead CSS: the "How it works" section was removed from the template in this deployment but the SCSS block remains. | Deferred — removing dead CSS is safe but out of OPTIMIZE scope (no behavior impact); note for next cleanup pass |

---

## Net Change Summary

- 7 fixes applied (1 in .ts, 6 in .html)
- 0 changes to .scss
- 0 changes to services or directives
- Build impact: negligible (trackBy adds < 100 bytes; loading="lazy" is a 14-character HTML attribute)
- All changes are reversible with a one-line revert per fix
