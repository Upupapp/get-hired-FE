/**
 * Internal Interview Scheduling MVP -- employer-facing TypeScript models.
 *
 * These mirror the already-implemented and verified backend contract for
 * `POST/GET/PATCH {api}/interview/scheduled*` exactly (field names, enums,
 * and response envelopes). Do not rename fields to "look nicer" -- every
 * name here must match the API 1:1.
 */

/** The 7 fixed interview-type labels the backend accepts. */
export const INTERVIEW_TYPES: readonly string[] = [
  'Phone Screen',
  'Initial Interview',
  'HR Interview',
  'Hiring Manager Interview',
  'Technical Interview',
  'Final Interview',
  'Custom Interview',
];

export const CUSTOM_INTERVIEW_TYPE = 'Custom Interview';

export type InterviewFormat = 'video_call' | 'phone' | 'in_person' | 'custom';

export const INTERVIEW_FORMATS: ReadonlyArray<{ value: InterviewFormat; label: string }> = [
  { value: 'video_call', label: 'Video Call' },
  { value: 'phone', label: 'Phone' },
  { value: 'in_person', label: 'In Person' },
  { value: 'custom', label: 'Custom' },
];

export type InterviewLifecycleState = 'scheduled' | 'cancelled';

/** Pre-computed by the backend -- always prefer this over doing your own date math. */
export type InterviewDisplayStatus = 'scheduled' | 'past' | 'cancelled';

export type InterviewNotificationState = 'pending' | 'sent' | 'failed' | 'not_configured';

export const DURATION_PRESETS: readonly number[] = [15, 30, 45, 60, 90];

/** Employer-view shape of one scheduled interview, exactly as returned by the API. */
export interface ScheduledInterview {
  interviewId: string;
  jobId: string;
  jobTitle: string;
  jobApplicationId: string;
  applicant: { uid: string; name: string | null; email: string | null };
  interviewer: { uid: string; name: string | null };
  interviewType: string;
  customTypeLabel: string | null;
  format: InterviewFormat;
  meetingLink: string | null;
  location: string | null;
  instructions: string | null;
  preparationNotes: string | null;
  startAt: string;
  endAt: string;
  timezone: string;
  durationMinutes: number;
  lifecycleState: InterviewLifecycleState;
  displayStatus: InterviewDisplayStatus;
  notificationState: InterviewNotificationState;
  notificationAttemptedAt: string | null;
  rescheduleCount: number;
  cancelledAt: string | null;
  cancelledByUid: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Fields shared by create and reschedule payloads. */
export interface InterviewScheduleFields {
  interviewType: string;
  customTypeLabel?: string;
  format: InterviewFormat;
  meetingLink?: string;
  location?: string;
  instructions?: string;
  preparationNotes?: string;
  startAt: string;
  durationMinutes: number;
  timezone: string;
}

export interface CreateScheduledInterviewRequest extends InterviewScheduleFields {
  applicationId: string;
  idempotencyKey?: string;
}

export type RescheduleInterviewRequest = InterviewScheduleFields;

export interface CancelInterviewRequest {
  reason?: string;
}

export interface ScheduleInterviewSuccess {
  interview: ScheduledInterview;
  replay?: boolean;
  notificationWarning: string | null;
}

export interface RescheduleInterviewSuccess {
  interview: ScheduledInterview;
  notificationWarning: string | null;
}

export interface CancelInterviewSuccess {
  interview: ScheduledInterview;
  notificationWarning: string | null;
}

export interface ScheduledInterviewListResponse {
  items: ScheduledInterview[];
  total: number;
}

export type InterviewListFilter = 'upcoming' | 'past' | 'cancelled';

/** Shape of `err.error` on a failed HttpClient request against these endpoints. */
export interface InterviewApiErrorBody {
  status: 'error';
  error: string;
  code?: 'VALIDATION_ERROR' | 'CONFLICT' | 'IDEMPOTENCY_CONFLICT' | 'INVALID_STATE_TRANSITION' | string;
  details?: string[];
}
