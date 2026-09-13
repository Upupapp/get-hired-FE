import { RecruitmentStorageUsageV4 } from '@main/employer-panel/employer-subscription/subscription-v4.models';

/**
 * The recruitment_storage block gh-be's employer summary composes for an employer with no plan,
 * serialised by running gh-be's own code at A2.3 72d4975 (never its working tree):
 * buildEntitlementUsage('recruitment_storage', usage, 0) with storageStatus from
 * getStorageStatus(used, 0).
 *
 * NO_PLAN_EMPTY is the case tests/employerSummaryStorage.test.js asserts ("with no plan the limit
 * is 0 and still present": limit 0, used 0, the sibling meters' warningLevel, storageStatus
 * no_plan). NO_PLAN_HOLDING_MEDIA is tests/storedMediaServiceErrors.test.js's "bytes stored
 * anyway" row: still no_plan, never full.
 */
export const NO_PLAN_EMPTY: RecruitmentStorageUsageV4 = {
  "key": "recruitment_storage",
  "used": 0,
  "limit": 0,
  "remaining": 0,
  "percentUsed": null,
  "warningLevel": "at_limit",
  "countSource": "stored_media.active",
  "countConfidence": "confirmed",
  "storageStatus": "no_plan"
};

export const NO_PLAN_HOLDING_MEDIA: RecruitmentStorageUsageV4 = {
  "key": "recruitment_storage",
  "used": 5368709120,
  "limit": 0,
  "remaining": 0,
  "percentUsed": null,
  "warningLevel": "at_limit",
  "countSource": "stored_media.active",
  "countConfidence": "confirmed",
  "storageStatus": "no_plan"
};
