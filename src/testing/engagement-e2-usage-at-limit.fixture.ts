import { EngagementUsage } from '@main/shared/engagement/engagement-contract.models';

/**
 * An unconfirmed usage block at warningLevel at_limit, as gh-be's engagement context serves it at 658d0a5, serialised by
 * running gh-be's own ctx.buildUsageBlock(null, usageAll, storageRead) in a scratch archive (never its working tree).
 *
 * USAGE_UNCONFIRMED_AT_LIMIT  no plan, so every limit is 0 and every count reads at_limit; and every read failed (the job and
 *                             video reads unavailable, the member read an error, storage unavailable). The placeholder
 *                             warningLevel must not reach the screen as a warning (gh-qa Q24 note 1).
 * Dump sha256 29d150952a075dfaa24bd80e434674a2a9d2e7e2316b2d21ab616a75a599db81. Regenerate; never edit a value by hand.
 */

export const E2_USAGE_UNCONFIRMED_AT_LIMIT: EngagementUsage = {
  "active_job_posts": {
    "key": "active_job_posts",
    "used": 0,
    "limit": 0,
    "remaining": 0,
    "percentUsed": null,
    "warningLevel": "at_limit",
    "countSource": "jobs.status",
    "countConfidence": "unavailable"
  },
  "admin_users": {
    "key": "admin_users",
    "used": 0,
    "limit": 0,
    "remaining": 0,
    "percentUsed": null,
    "warningLevel": "at_limit",
    "countSource": "company_employees.not_suspended",
    "countConfidence": "error"
  },
  "video_responses": {
    "key": "video_responses",
    "used": 0,
    "limit": 0,
    "remaining": 0,
    "percentUsed": null,
    "warningLevel": "at_limit",
    "countSource": "video_responses.job_ids",
    "countConfidence": "unavailable"
  },
  "recruitment_storage": {
    "key": "recruitment_storage",
    "used": 0,
    "limit": 0,
    "remaining": 0,
    "percentUsed": null,
    "warningLevel": "at_limit",
    "countSource": "stored_media.active",
    "countConfidence": "unavailable",
    "storageStatus": null
  }
};
