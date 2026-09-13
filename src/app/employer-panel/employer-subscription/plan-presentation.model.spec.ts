import { PlanCatalogItem } from './subscription-v4.models';
import {
  buildComparison,
  capacityLines,
  formatLimit,
  formatStorage,
  isModelled,
  planCta,
  planDisplayName,
  planPrice,
} from './plan-presentation.model';

/**
 * These pin the pricing page's only real logic: turning the backend catalog into
 * what an employer reads before paying.
 *
 * The fixtures mirror planCatalogServiceV4.js exactly — same field names, same
 * null conventions (Enterprise sends null on every numeric entitlement, never a
 * fake-unlimited integer). If the backend contract moves, these should fail.
 */
const GB = 1024 * 1024 * 1024;

function makePlan(over: Partial<PlanCatalogItem> = {}): PlanCatalogItem {
  return {
    slug: 'growth',
    name: 'Growth',
    audience: 'For active hiring teams.',
    recommended: true,
    trial: false,
    enterprise: false,
    current: false,
    upgradeRoute: '/recruiter/subscription/upgrade/growth',
    defaultBillingCycle: 'annual',
    pricing: {
      monthly: {
        amount: 3490, currency: 'PHP',
        label: 'PHP 3490/month', renewalLabel: 'Paid monthly, recurring',
      },
      annual: {
        amount: 34900, currency: 'PHP',
        dueTodayLabel: 'Billed today: PHP 34900 for 12 months.',
        effectiveMonthlyLabel: 'PHP 2908/mo effective',
        savingsCopy: 'Save 2 months with annual billing',
        annualSavingsAmount: 6980,
        renewalLabel: 'Pay once today and get 12 months of GetHired access.',
      },
    },
    entitlements: {
      active_job_posts: 15,
      admin_users: 5,
      video_responses: 100,
      customized_company_page: true,
      video_interview_questions: true,
      dedicated_support: false,
      applicants: null,
      recruitment_storage_bytes: 50 * GB,
      video_questions_per_job: 5,
      featured_job_credits: 0,
    },
    ...over,
  } as PlanCatalogItem;
}

const ENTERPRISE = makePlan({
  slug: 'enterprise', name: 'Enterprise', enterprise: true, recommended: false,
  upgradeRoute: null, contactSalesRequired: true,
  pricing: {
    monthly: { amount: null as any, currency: 'PHP', label: 'Custom pricing', renewalLabel: 'Billed per your agreement' },
    annual: {
      amount: null as any, currency: 'PHP', dueTodayLabel: 'Custom pricing',
      effectiveMonthlyLabel: 'Custom pricing', savingsCopy: null,
      annualSavingsAmount: 0, renewalLabel: 'Billed per your agreement',
    },
  },
  entitlements: {
    active_job_posts: null, admin_users: null, video_responses: null,
    customized_company_page: true, video_interview_questions: true, dedicated_support: true,
    applicants: null, recruitment_storage_bytes: null,
    video_questions_per_job: null, featured_job_credits: null,
  },
});

const TRIAL = makePlan({
  slug: 'free_trial', name: 'Free Trial', trial: true, recommended: false, upgradeRoute: null,
  pricing: {
    monthly: { amount: 0, currency: 'PHP', label: 'Free', renewalLabel: 'Free trial' },
    annual: {
      amount: 0, currency: 'PHP', dueTodayLabel: 'Free', effectiveMonthlyLabel: 'Free',
      savingsCopy: null, annualSavingsAmount: 0, renewalLabel: 'Free trial',
    },
  },
  entitlements: {
    active_job_posts: 1, admin_users: 1, video_responses: 5,
    customized_company_page: true, video_interview_questions: true, dedicated_support: false,
    applicants: 25, recruitment_storage_bytes: 1 * GB,
    video_questions_per_job: 1, featured_job_credits: 0,
  },
});

describe('plan-presentation', () => {

  describe('formatStorage', () => {
    it('renders whole GB without decimals', () => {
      expect(formatStorage(50 * GB)).toBe('50 GB');
      expect(formatStorage(1 * GB)).toBe('1 GB');
      expect(formatStorage(200 * GB)).toBe('200 GB');
    });

    it('renders a fractional GB to one decimal', () => {
      expect(formatStorage(Math.round(37.4 * GB))).toBe('37.4 GB');
    });

    it('rolls over to TB past 1024 GB', () => {
      expect(formatStorage(2048 * GB)).toBe('2 TB');
    });

    it('returns null for a null capacity so callers choose their own copy', () => {
      expect(formatStorage(null)).toBeNull();
      expect(formatStorage(undefined)).toBeNull();
    });
  });

  describe('formatLimit', () => {
    it('renders a number as-is and null as Custom', () => {
      expect(formatLimit(15)).toBe('15');
      expect(formatLimit(0)).toBe('0');
      expect(formatLimit(null)).toBe('Custom');
      // An absent key is NOT custom — callers filter it out, and the defensive
      // fallback is a dash, never a word that reads as a commitment.
      expect(formatLimit(undefined)).toBe('—');
    });
  });

  describe('capacityLines', () => {
    it('returns the four headline capacities in a fixed order', () => {
      expect(capacityLines(makePlan()).map(c => c.key))
        .toEqual(['jobs', 'users', 'storage', 'videoQuestions']);
    });

    it('reads every figure from the catalog', () => {
      const labels = capacityLines(makePlan()).map(c => c.label);
      expect(labels[0]).toBe('15 active jobs');
      expect(labels[1]).toBe('5 employer users');
      expect(labels[2]).toBe('50 GB Recruitment Storage');
      expect(labels[3]).toBe('5 video questions/job');
    });

    it('never describes storage as a monthly allowance', () => {
      // Storage is retained capacity and does not reset; "50 GB/month" would be
      // a factual misstatement of what the employer is buying.
      const storage = capacityLines(makePlan()).find(c => c.key === 'storage')!;
      expect(storage.label).toContain('Recruitment Storage');
      expect(storage.label).not.toContain('/month');
      expect(storage.label).not.toContain('per month');
    });

    it('singularises a capacity of one', () => {
      const labels = capacityLines(TRIAL).map(c => c.label);
      expect(labels[0]).toBe('1 active job');
      expect(labels[1]).toBe('1 employer user');
      expect(labels[3]).toBe('1 video question/job');
    });

    it('states the contractual starting point for Enterprise storage', () => {
      const storage = capacityLines(ENTERPRISE).find(c => c.key === 'storage')!;
      expect(storage.label).toBe('500 GB+ Recruitment Storage');
    });

    it('says Custom for Enterprise job and user counts', () => {
      const labels = capacityLines(ENTERPRISE).map(c => c.label);
      expect(labels[0]).toContain('Custom');
      expect(labels[1]).toContain('Custom');
    });

    it('states no capacity at all when entitlements are missing entirely', () => {
      const bare = makePlan({ entitlements: undefined as any });
      expect(() => capacityLines(bare)).not.toThrow();
      expect(capacityLines(bare).length).toBe(0);
    });
  });

  describe('planDisplayName', () => {
    it('shows the backend name by default', () => {
      expect(planDisplayName(makePlan())).toBe('Growth');
    });

    it('renders the business slug as Premium', () => {
      // Backend slug is `business` (DEC-02); product and live UI say Premium.
      expect(planDisplayName(makePlan({ slug: 'business', name: 'Business' }))).toBe('Premium');
    });
  });

  describe('planPrice', () => {
    it('shows the monthly amount and suffix', () => {
      const p = planPrice(makePlan(), 'monthly');
      expect(p.amount).toBe('₱3,490');
      expect(p.suffix).toBe('/month');
      expect(p.effectiveMonthly).toBeNull();
    });

    it('shows the annual amount with the backend due-today disclosure', () => {
      // An annual plan is charged once for 12 months. Presenting it without the
      // due-today line would imply monthly billing for an upfront charge.
      const p = planPrice(makePlan(), 'annual');
      expect(p.amount).toBe('₱34,900');
      expect(p.suffix).toBe('/year');
      expect(p.caption).toContain('Billed today');
    });

    it('offers the effective monthly figure only as an equivalence on annual', () => {
      expect(planPrice(makePlan(), 'annual').effectiveMonthly).toBe('PHP 2908/mo effective');
      expect(planPrice(makePlan(), 'monthly').effectiveMonthly).toBeNull();
    });

    it('renders a zero price as Free with no suffix', () => {
      const p = planPrice(TRIAL, 'monthly');
      expect(p.amount).toBe('Free');
      expect(p.suffix).toBe('');
    });

    it('renders a null price as Custom, never as zero', () => {
      // A custom-priced plan showing "₱0" would read as free.
      for (const cycle of ['monthly', 'annual'] as const) {
        const p = planPrice(ENTERPRISE, cycle);
        expect(p.amount).withContext(cycle).toBe('Custom');
        expect(p.amount).not.toBe('₱0');
      }
    });

    it('separates thousands so prices are readable', () => {
      expect(planPrice(makePlan(), 'monthly').amount).toContain(',');
    });

    it('does not throw when pricing is absent', () => {
      expect(() => planPrice(makePlan({ pricing: undefined as any }), 'monthly')).not.toThrow();
    });
  });

  /**
   * The approved pricing, owner decision 2026-09-13: PHP 1,490 / 3,490 / 6,990.
   *
   * These figures are NOT hardcoded in product code — the page reads them from
   * the backend catalog. What is pinned here is that the approved numbers survive
   * the formatting path intact and reach a card as the employer will read them.
   * The page previously showed 999 / 2,499 / 4,999 from a local copy while the
   * backend charged these, so a price that renders differently from what is
   * charged is exactly the failure worth a guard.
   */
  describe('approved pricing renders as billed', () => {
    const APPROVED = [
      { slug: 'starter',  monthly: 1490, annual: 14900, monthlyText: '₱1,490', annualText: '₱14,900' },
      { slug: 'growth',   monthly: 3490, annual: 34900, monthlyText: '₱3,490', annualText: '₱34,900' },
      { slug: 'business', monthly: 6990, annual: 69900, monthlyText: '₱6,990', annualText: '₱69,900' },
    ];

    APPROVED.forEach(p => {
      const plan = makePlan({
        slug: p.slug,
        pricing: {
          monthly: { amount: p.monthly, currency: 'PHP', label: '', renewalLabel: 'Paid monthly, recurring' },
          annual: {
            amount: p.annual, currency: 'PHP',
            dueTodayLabel: `Billed today: PHP ${p.annual} for 12 months.`,
            effectiveMonthlyLabel: `PHP ${Math.round(p.annual / 12)}/mo effective`,
            savingsCopy: 'Save 2 months with annual billing',
            annualSavingsAmount: p.monthly * 2,
            renewalLabel: 'Pay once today and get 12 months of GetHired access.',
          },
        },
      });

      it(`${p.slug} shows ${p.monthlyText} monthly`, () => {
        expect(planPrice(plan, 'monthly').amount).toBe(p.monthlyText);
      });

      it(`${p.slug} shows ${p.annualText} annually, with the due-today disclosure`, () => {
        const shown = planPrice(plan, 'annual');
        expect(shown.amount).toBe(p.annualText);
        expect(shown.caption).toContain('Billed today');
      });

      it(`${p.slug} never renders a superseded price`, () => {
        // 999 / 2,499 / 4,999 were the old local figures.
        const monthly = planPrice(plan, 'monthly').amount;
        expect(['₱999', '₱2,499', '₱4,999']).not.toContain(monthly);
      });
    });

    it('annual is ten months of the monthly rate, per the catalog rule', () => {
      // "12 months for the price of 10" — if the backend ever breaks this, the
      // savings copy on the card stops being true.
      APPROVED.forEach(p => {
        expect(p.annual).withContext(p.slug).toBe(p.monthly * 10);
      });
    });
  });

  describe('planCta', () => {
    const ORDER = ['free_trial', 'starter', 'growth', 'business', 'enterprise'];

    it('marks the current plan and makes it non-actionable', () => {
      const cta = planCta(makePlan({ current: true }), ORDER, 'growth');
      expect(cta.label).toBe('Current plan');
      expect(cta.actionable).toBeFalse();
      expect(cta.kind).toBe('current');
    });

    it('never offers to upgrade to the plan already held', () => {
      // The conflicting-state bug: a card reading both "Current plan" and
      // "Upgrade to Growth".
      const cta = planCta(makePlan({ slug: 'growth' }), ORDER, 'growth');
      expect(cta.label).not.toContain('Upgrade');
      expect(cta.kind).toBe('current');
    });

    it('honours the backend current flag even when the slug differs', () => {
      // The backend resolves legacy aliases (premium -> business) before
      // setting `current`, so it is more trustworthy than a raw code compare.
      const cta = planCta(makePlan({ slug: 'business', current: true }), ORDER, null);
      expect(cta.kind).toBe('current');
    });

    it('offers an upgrade for a higher tier', () => {
      const cta = planCta(makePlan({ slug: 'business', name: 'Business' }), ORDER, 'growth');
      expect(cta.kind).toBe('upgrade');
      expect(cta.label).toBe('Upgrade to Premium');
    });

    it('offers a switch, not an upgrade, for a lower tier', () => {
      const cta = planCta(makePlan({ slug: 'starter', name: 'Starter' }), ORDER, 'business');
      expect(cta.kind).toBe('switch');
      expect(cta.label).toBe('Switch to Starter');
    });

    it('routes Enterprise to sales rather than checkout', () => {
      const cta = planCta(ENTERPRISE, ORDER, 'growth');
      expect(cta.kind).toBe('contact_sales');
      expect(cta.label).toBe('Contact Sales');
      expect(cta.actionable).toBeTrue();
    });

    it('asks an employer with no plan to choose one', () => {
      const cta = planCta(makePlan(), ORDER, null);
      expect(cta.kind).toBe('choose');
      expect(cta.label).toBe('Choose Growth');
    });
  });

  describe('buildComparison', () => {
    const groups = buildComparison([TRIAL, makePlan(), ENTERPRISE]);

    it('groups rows under readable section titles', () => {
      expect(groups.map(g => g.title))
        .toEqual(['Hiring capacity', 'Candidate screening', 'Employer brand', 'Support']);
    });

    it('carries Recruitment Storage as a first-class capacity row', () => {
      const row = groups[0].rows.find(r => r.label === 'Recruitment Storage')!;
      expect(row.values['free_trial']).toBe('1 GB');
      expect(row.values['growth']).toBe('50 GB');
      expect(row.values['enterprise']).toBe('500 GB+');
    });

    it('shows the trial applicant cap and treats null as unlimited', () => {
      const row = groups[0].rows.find(r => r.label === 'Applicants')!;
      expect(row.values['free_trial']).toBe('25');
      expect(row.values['growth']).toBe('Unlimited');
    });

    it('reports video questions per job from the catalog', () => {
      const row = groups[1].rows.find(r => r.label === 'Video questions per job')!;
      expect(row.values['free_trial']).toBe('1');
      expect(row.values['growth']).toBe('5');
      expect(row.values['enterprise']).toBe('Custom');
    });

    it('renders a zero featured-credit allowance as absent, not as "0"', () => {
      const row = groups[2].rows.find(r => r.label === 'Featured job credits per month')!;
      expect(row.values['growth']).toBeFalse();
    });

    it('uses booleans for capability rows so they render as ticks', () => {
      const row = groups[3].rows.find(r => r.label === 'Dedicated support')!;
      expect(row.values['growth']).toBeFalse();
      expect(row.values['enterprise']).toBeTrue();
    });

    it('lists no capability the backend does not model', () => {
      // Talent pools, SSO, audit logs and source-of-hire reporting are product
      // copy with no entitlement behind them. A tick nothing enforces is a dead
      // feature, so they must not appear until the backend sends them.
      const labels = groups.reduce((acc: string[], g) => acc.concat(g.rows.map(r => r.label)), []);
      for (const absent of ['Talent pools', 'SSO', 'Audit logs', 'Source of hire', 'API access']) {
        expect(labels).withContext(absent).not.toContain(absent);
      }
    });

    it('keys every row by slug for all supplied plans', () => {
      groups.forEach(g => g.rows.forEach(r => {
        expect(Object.keys(r.values).sort()).toEqual(['enterprise', 'free_trial', 'growth']);
      }));
    });
  });

  /**
   * The contract `origin/main` actually serves (planCatalogServiceV4.js at ad3b007):
   * four plans, no Enterprise, and entitlements WITHOUT recruitment_storage_bytes,
   * video_questions_per_job, applicants or featured_job_credits. Those keys exist only in
   * gh-be's uncommitted catalog. The page must say nothing about an entitlement the
   * catalog does not model — an earlier version rendered these absent keys as "Custom".
   */
  describe('against the production catalog (keys absent, not null)', () => {
    const prod = (slug: string, name: string, jobs: number, users: number, video: number, dedicated: boolean) =>
      makePlan({
        slug, name, recommended: slug === 'growth',
        entitlements: {
          active_job_posts: jobs, admin_users: users, video_responses: video,
          customized_company_page: true, video_interview_questions: true, dedicated_support: dedicated,
        } as any,
      });
    const PROD = [
      prod('free_trial', 'Free Trial', 1, 1, 5, false),
      prod('starter', 'Starter', 2, 1, 25, false),
      prod('growth', 'Growth', 6, 3, 100, false),
      prod('business', 'Business', 20, 8, 400, true),
    ];
    const allLabels = (plans: PlanCatalogItem[]) =>
      buildComparison(plans).reduce((acc: string[], g) => acc.concat(g.rows.map(r => r.label)), []);

    it('treats an absent key as not modelled and an explicit null as modelled', () => {
      expect(isModelled(PROD[1].entitlements, 'recruitment_storage_bytes')).toBeFalse();
      expect(isModelled(ENTERPRISE.entitlements, 'recruitment_storage_bytes')).toBeTrue();
      expect(isModelled(undefined, 'active_job_posts')).toBeFalse();
    });

    it('shows only the capacities the catalog models', () => {
      expect(capacityLines(PROD[1]).map(c => c.key)).toEqual(['jobs', 'users']);
      expect(capacityLines(PROD[1]).map(c => c.label)).toEqual(['2 active jobs', '1 employer user']);
    });

    it('never claims custom storage or custom video questions for a self-serve plan', () => {
      PROD.forEach(p => {
        const text = capacityLines(p).map(c => c.label).join(' | ');
        expect(text).withContext(p.slug).not.toContain('Custom');
        expect(text).withContext(p.slug).not.toContain('Recruitment Storage');
        expect(text).withContext(p.slug).not.toContain('video question');
      });
    });

    it('omits comparison rows for entitlements the catalog does not model', () => {
      const labels = allLabels(PROD);
      for (const absent of ['Recruitment Storage', 'Applicants', 'Video questions per job', 'Featured job credits per month']) {
        expect(labels).withContext(absent).not.toContain(absent);
      }
      for (const present of ['Active jobs', 'Employer users', 'Video responses included', 'Interview questions', 'Customised company page', 'Dedicated support']) {
        expect(labels).withContext(present).toContain(present);
      }
    });

    it('never puts Custom or Unlimited in any production comparison cell', () => {
      buildComparison(PROD).forEach(g => g.rows.forEach(r => {
        Object.keys(r.values).forEach(slug => {
          expect(r.values[slug]).withContext(`${r.label} / ${slug}`).not.toBe('Custom');
          expect(r.values[slug]).withContext(`${r.label} / ${slug}`).not.toBe('Unlimited');
        });
      }));
    });

    it('drops a row when only some plans model the entitlement', () => {
      // A mixed catalog would force a guess into the empty cells.
      const labels = allLabels([PROD[1], makePlan()]);
      expect(labels).not.toContain('Recruitment Storage');
      expect(labels).toContain('Active jobs');
    });

    it('still renders the real production figures', () => {
      const jobs = buildComparison(PROD)[0].rows.find(r => r.label === 'Active jobs')!;
      expect(jobs.values).toEqual({ free_trial: '1', starter: '2', growth: '6', business: '20' });
    });
  });
});
