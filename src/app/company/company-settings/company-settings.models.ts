// ─── CompanySettingsViewModel ──────────────────────────────────────────────────
// GETHIRED_COMPANY_SETTINGS_PUBLIC_PROFILE_FULL_REVAMP_V2_BRAND_OS_NEXTADMIN
// Phase 6 — canonical ViewModel shape for the Employer Brand Center page.
// ─────────────────────────────────────────────────────────────────────────────

export interface CompanySettingsViewModel {
  company: {
    id: string | number;
    name: string;
    slug?: string | null;
    logoUrl?: string | null;
    logoVersion?: string | null;
    bannerUrl?: string | null;
    description?: string | null;
    industry?: string | null;
    workSetup?: string | null;
    employeeCount?: number | null;
    website?: string | null;
    email?: string | null;
    phone?: string | null;
    publicProfileEnabled?: boolean;
    publicProfileUrl?: string | null;
    publicProfileStatus?: 'live' | 'hidden' | 'incomplete' | 'draft';
    updatedAt?: string | null;
  };
  address: {
    addressLine1?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    zipCode?: string | null;
    publiclyShown?: boolean;
  };
  socialLinks: {
    linkedin?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    website?: string | null;
  };
  readiness: {
    profileCompleteness: number;
    missingFields: Array<{ key: string; label: string; priority: 'high' | 'medium' | 'low' }>;
    publicProfileReady: boolean;
  };
  meta: {
    isLoading: boolean;
    isSaving: boolean;
    isUploadingLogo: boolean;
    hasUnsavedChanges: boolean;
    lastSavedAt?: string | null;
  };
}
