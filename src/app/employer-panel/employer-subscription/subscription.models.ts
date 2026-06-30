// ── Invoice Vault types ───────────────────────────────────────────────────────

export type InvoiceStatus =
  | 'draft' | 'issued' | 'paid' | 'pending' | 'failed'
  | 'voided' | 'refunded' | 'trial' | 'manual' | string;

export interface InvoiceLineItem {
  description: string;
  qty: number;
  unit_price: number;
  total: number;
}

export interface InvoiceEvent {
  id: string;
  eventType: string;
  eventSource: string;
  actorUid?: string | null;
  metadataJson?: any;
  createdAt: string;
}

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  currency: string;
  totalAmount: number;
  planName?: string | null;
  billingCycle?: string | null;
  billingPeriodStart?: string | null;
  billingPeriodEnd?: string | null;
  issuedAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  paymentMethodLabel?: string | null;
  hasDownload: boolean;
}

export interface InvoiceDetail extends InvoiceListItem {
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  amountPaid: number;
  amountDue: number;
  planSlug?: string | null;
  dueAt?: string | null;
  voidedAt?: string | null;
  updatedAt?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  lineItems: InvoiceLineItem[];
  paymentReference?: string | null;
  events: InvoiceEvent[];
  downloadToken?: string | null;
}

export interface InvoiceListResponse {
  success: boolean;
  invoices: InvoiceListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface BillingProfile {
  companyId?: string;
  legalName?: string | null;
  billingEmail?: string | null;
  financeContactName?: string | null;
  financeContactEmail?: string | null;
  billingAddressLine1?: string | null;
  billingAddressLine2?: string | null;
  city?: string | null;
  provinceState?: string | null;
  country?: string | null;
  postalCode?: string | null;
  taxIdentifier?: string | null;
  autoSendInvoices?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// ── Entitlement types ─────────────────────────────────────────────────────────

export interface EntitlementUsage {
  used: number;
  included: number | 'unlimited' | null;
  blocked?: boolean;
  period?: 'month' | 'plan' | 'lifetime' | null;
}

export interface BooleanEntitlement {
  included: boolean;
  blocked?: boolean;
}

export interface EmployerSubscriptionSummary {
  company: {
    id: number | string;
    name: string;
    logoUrl?: string | null;
    email?: string | null;
    publicProfileUrl?: string | null;
    profileCompleteness?: number | null;
  };
  currentPlan: {
    id: number | string | null;
    code: string | null;
    name: string;
    status: 'none' | 'trialing' | 'trial_ending_soon' | 'active' | 'past_due' | 'payment_failed' | 'pending' | 'cancelled' | 'expired' | 'manual';
    billingInterval?: 'monthly' | 'yearly' | 'one_time' | null;
    currency?: string | null;
    priceAmount?: number | null;
    startedAt?: string | null;
    trialStartedAt?: string | null;
    trialEndsAt?: string | null;
    currentPeriodStart?: string | null;
    currentPeriodEnd?: string | null;
    cancelAtPeriodEnd?: boolean;
    cancelledAt?: string | null;
    paymentProvider?: 'paymongo' | 'manual' | 'none' | string;
    planHealth?: 'healthy' | 'near_limit' | 'action_needed' | 'payment_issue' | 'unknown';
  };
  usage: {
    recruitment: {
      activeJobs: EntitlementUsage;
      adminUsers: EntitlementUsage;
      videoResponses: EntitlementUsage;
      interviewQuestions?: BooleanEntitlement;
      messaging?: BooleanEntitlement;
    };
    branding?: {
      companyPage?: BooleanEntitlement;
      publicProfile?: BooleanEntitlement;
      logoAndBanner?: BooleanEntitlement;
    };
  };
  recommendedPlan?: {
    planCode: string;
    planName: string;
    reason: string;
    benefits: string[];
    ctaLabel: string;
  } | null;
  availablePlans: Array<{
    id: number | string;
    code: string;
    name: string;
    description: string;
    audience: string;
    priceMonthly?: number | null;
    currency: string;
    recommended?: boolean;
    current?: boolean;
    trial?: boolean;
    enterprise?: boolean;
    features: Array<{
      key: string;
      label: string;
      included: boolean;
      value?: string | number | boolean | null;
      highlight?: boolean;
    }>;
    limits: {
      activeJobs?: number | 'unlimited' | null;
      adminUsers?: number | 'unlimited' | null;
      videoResponses?: number | 'unlimited' | null;
    };
    ctaLabel: string;
    ctaAction: 'current' | 'upgrade' | 'downgrade' | 'contact_sales' | 'start_trial';
  }>;
  invoices: Array<{
    id: number | string;
    date: string;
    description: string;
    planName?: string | null;
    amount: number;
    currency: string;
    status: 'paid' | 'pending' | 'failed' | 'refunded' | 'cancelled' | 'trial' | 'manual' | string;
    paymentMethodLabel?: string | null;
    receiptUrl?: string | null;
  }>;
  paymentMethod?: {
    type?: string | null;
    brand?: string | null;
    last4?: string | null;
    walletName?: string | null;
    provider?: string | null;
  } | null;
  billingActions: Array<{
    type: 'choose_plan' | 'upgrade' | 'fix_payment' | 'retry_payment' | 'manage_payment_method' | 'download_invoice' | 'contact_support' | 'reactivate' | 'resume' | 'refresh_status';
    label: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}
