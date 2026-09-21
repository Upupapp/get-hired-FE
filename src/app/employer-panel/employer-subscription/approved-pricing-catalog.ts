import { PlanCatalogItem, PricingCatalog } from './subscription-v4.models';

const GB = 1024 * 1024 * 1024;

/**
 * Compatibility snapshot of the approved backend catalog.
 *
 * Some production API versions do not expose /subscriptions/pricing-catalog and
 * return only the current and recommended plans in the employer summary. This
 * snapshot keeps the public comparison complete in that case. A successful
 * catalog response always replaces it, and checkout still obtains the amount
 * and entitlements from the server before redirecting to PayMongo.
 */
export const APPROVED_PRICING_CATALOG: PricingCatalog = {
  annualCopy: 'Save 2 months with annual billing',
  mustDiscloseAnnualDueToday: true,
  upgradeLandingDefaultCycle: 'monthly',
  monthlyAvailable: true,
  annualAvailable: true,
  plans: [
    plan('free_trial', 'Free Trial', 'Try GetHired with limited hiring tools.', 0, 0, {
      active_job_posts: 1, admin_users: 1, applicants: 25,
      recruitment_storage_bytes: GB, video_questions_per_job: 1, video_responses: 5,
      featured_job_credits: 0, customized_company_page: true,
      video_interview_questions: true, dedicated_support: false,
    }, { trial: true }),
    plan('starter', 'Starter', 'For small employers hiring occasionally.', 1490, 14900, {
      active_job_posts: 5, admin_users: 2, applicants: null,
      recruitment_storage_bytes: 10 * GB, video_questions_per_job: 3, video_responses: 25,
      featured_job_credits: 0, customized_company_page: true,
      video_interview_questions: true, dedicated_support: false,
    }),
    plan('growth', 'Growth', 'For active hiring teams.', 3490, 34900, {
      active_job_posts: 15, admin_users: 5, applicants: null,
      recruitment_storage_bytes: 50 * GB, video_questions_per_job: 5, video_responses: 100,
      featured_job_credits: 0, customized_company_page: true,
      video_interview_questions: true, dedicated_support: false,
    }, { recommended: true }),
    plan('business', 'Premium', 'For frequent hiring and larger teams with dedicated support.', 5990, 59900, {
      active_job_posts: 40, admin_users: 15, applicants: null,
      recruitment_storage_bytes: 200 * GB, video_questions_per_job: 10, video_responses: 400,
      featured_job_credits: 5, customized_company_page: true,
      video_interview_questions: true, dedicated_support: true,
    }),
    plan('enterprise', 'Enterprise', 'For multi-brand and high-volume hiring with a custom agreement.', null, null, {
      active_job_posts: null, admin_users: null, applicants: null,
      recruitment_storage_bytes: null, video_questions_per_job: null, video_responses: null,
      featured_job_credits: null, customized_company_page: true,
      video_interview_questions: true, dedicated_support: true,
    }, { enterprise: true }),
  ],
};

function plan(
  slug: string,
  name: string,
  audience: string,
  monthly: number | null,
  annual: number | null,
  entitlements: PlanCatalogItem['entitlements'],
  flags: { trial?: boolean; recommended?: boolean; enterprise?: boolean } = {},
): PlanCatalogItem {
  const annualSavings = monthly !== null && annual !== null ? monthly * 12 - annual : 0;
  return {
    slug, name, audience,
    recommended: !!flags.recommended,
    trial: !!flags.trial,
    enterprise: !!flags.enterprise,
    current: false,
    pricing: {
      monthly: {
        amount: monthly as any,
        currency: 'PHP',
        label: monthly === null ? 'Custom' : `PHP ${monthly}/month`,
        renewalLabel: monthly && monthly > 0 ? 'Paid monthly, recurring' : (flags.trial ? '7-day free trial' : ''),
      },
      annual: {
        amount: annual as any,
        currency: 'PHP',
        dueTodayLabel: annual === null ? '' : (annual === 0 ? '7-day free trial' : `Billed today: PHP ${annual.toLocaleString('en-PH')} for 12 months.`),
        effectiveMonthlyLabel: annual && annual > 0 ? `Equivalent to PHP ${Math.round(annual / 12).toLocaleString('en-PH')}/month` : '',
        savingsCopy: annualSavings > 0 ? 'Save 2 months with annual billing' : null,
        annualSavingsAmount: annualSavings,
        renewalLabel: annual && annual > 0 ? 'Pay once today and get 12 months of GetHired access.' : '',
      },
    },
    entitlements,
    upgradeRoute: flags.enterprise || flags.trial ? null : `/recruiter/subscription/upgrade/${slug}`,
    contactSalesRequired: !!flags.enterprise,
    defaultBillingCycle: 'monthly',
  };
}
