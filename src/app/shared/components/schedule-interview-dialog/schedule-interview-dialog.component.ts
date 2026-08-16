import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  CUSTOM_INTERVIEW_TYPE,
  CreateScheduledInterviewRequest,
  DURATION_PRESETS,
  INTERVIEW_FORMATS,
  INTERVIEW_TYPES,
  InterviewFormat,
  RescheduleInterviewRequest,
  ScheduledInterview,
} from '@app-shared/interview-scheduling/interview-scheduling.models';
import { InterviewSchedulingService } from '@app-shared/interview-scheduling/interview-scheduling.service';
import {
  detectBrowserTimeZone,
  generateUuidV4,
  isValidTimeZone,
  splitIsoInTimeZone,
  zonedWallTimeToUtcIso,
} from '@app-shared/interview-scheduling/interview-timezone.utils';

/** `create` schedules a brand-new interview; `reschedule` resubmits the whole
 * form (per the API contract, reschedule is a full replace, not a patch of
 * individual fields) against an existing interview. */
export interface ScheduleInterviewDialogData {
  mode: 'create' | 'reschedule';
  // required when mode === 'create'
  jobId?: string;
  applicationId?: string;
  applicantName?: string;
  jobTitle?: string;
  // required when mode === 'reschedule'
  interview?: ScheduledInterview;
}

export interface ScheduleInterviewDialogResult {
  interview: ScheduledInterview;
  notificationWarning: string | null;
}

const CONFLICT_MESSAGE = 'That time is no longer available';
const CONFLICT_SUBMESSAGE = 'Choose another time and try again.';

function futureStartValidator(getIso: () => string | null): ValidatorFn {
  return (_: AbstractControl): ValidationErrors | null => {
    let iso: string | null;
    try {
      iso = getIso();
    } catch {
      return { invalidStart: true };
    }
    if (!iso) { return null; }
    return new Date(iso).getTime() > Date.now() ? null : { startInPast: true };
  };
}

@Component({
  selector: 'app-schedule-interview-dialog',
  templateUrl: './schedule-interview-dialog.component.html',
  styleUrls: ['./schedule-interview-dialog.component.scss'],
})
export class ScheduleInterviewDialogComponent implements OnInit {
  readonly interviewTypes = INTERVIEW_TYPES;
  readonly formats = INTERVIEW_FORMATS;
  readonly durationPresets = DURATION_PRESETS;
  readonly customTypeValue = CUSTOM_INTERVIEW_TYPE;

  form: FormGroup;
  isReschedule = false;
  applicantName = 'this applicant';
  jobTitle = '';

  submitting = false;
  conflictError = false;
  serverErrorMessage: string | null = null;
  fieldErrors: string[] = [];
  successResult: ScheduleInterviewDialogResult | null = null;

  /** One key per dialog-open session; reused across retries of the same
   * submission so a network retry never creates a duplicate interview. Only
   * regenerated when the employer closes and reopens the dialog. */
  private readonly idempotencyKey = generateUuidV4();

  constructor(
    public dialogRef: MatDialogRef<ScheduleInterviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ScheduleInterviewDialogData,
    private fb: FormBuilder,
    private interviewService: InterviewSchedulingService
  ) {}

  ngOnInit(): void {
    this.isReschedule = this.data.mode === 'reschedule';
    const existing = this.data.interview || null;

    if (this.isReschedule && existing) {
      this.applicantName = existing.applicant.name || existing.applicant.email || 'this applicant';
      this.jobTitle = existing.jobTitle || '';
    } else {
      this.applicantName = this.data.applicantName || 'this applicant';
      this.jobTitle = this.data.jobTitle || '';
    }

    const detectedTz = detectBrowserTimeZone();
    const initialTz = existing?.timezone || detectedTz;
    const initialDateTime = existing ? splitIsoInTimeZone(existing.startAt, existing.timezone) : null;
    const initialPreset = this.matchPreset(existing?.durationMinutes ?? null);

    this.form = this.fb.group(
      {
        interviewType: [existing?.interviewType || '', Validators.required],
        customTypeLabel: [existing?.customTypeLabel || ''],
        date: [initialDateTime?.date || '', Validators.required],
        time: [initialDateTime?.time || '', Validators.required],
        timezone: [initialTz, [Validators.required, this.timezoneValidator]],
        durationPreset: [initialPreset, Validators.required],
        durationCustom: [initialPreset === 'custom' ? existing?.durationMinutes : null],
        format: [existing?.format || '', Validators.required],
        meetingLink: [existing?.meetingLink || ''],
        location: [existing?.location || ''],
        instructions: [existing?.instructions || ''],
        preparationNotes: [existing?.preparationNotes || ''],
      },
      { validators: futureStartValidator(() => this.computeStartAtIsoSafe()) }
    );

    this.form.get('interviewType')!.valueChanges.subscribe(() => this.refreshConditionalValidators());
    this.form.get('format')!.valueChanges.subscribe(() => this.refreshConditionalValidators());
    this.form.get('durationPreset')!.valueChanges.subscribe(() => this.refreshConditionalValidators());
    this.refreshConditionalValidators();
  }

  private timezoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) { return null; }
    return isValidTimeZone(control.value) ? null : { invalidTimezone: true };
  }

  private matchPreset(minutes: number | null | undefined): number | 'custom' {
    if (minutes == null) { return 30; }
    return (DURATION_PRESETS as number[]).includes(minutes) ? minutes : 'custom';
  }

  private refreshConditionalValidators(): void {
    const type = this.form.get('interviewType')!.value;
    const customLabelCtrl = this.form.get('customTypeLabel')!;
    customLabelCtrl.setValidators(
      type === this.customTypeValue ? [Validators.required, Validators.maxLength(120)] : [Validators.maxLength(120)]
    );
    customLabelCtrl.updateValueAndValidity({ emitEvent: false });

    const format: InterviewFormat = this.form.get('format')!.value;
    const meetingLinkCtrl = this.form.get('meetingLink')!;
    const locationCtrl = this.form.get('location')!;
    const instructionsCtrl = this.form.get('instructions')!;

    meetingLinkCtrl.setValidators(
      format === 'video_call' ? [Validators.required, Validators.pattern(/^https:\/\/\S+$/i)] : []
    );
    locationCtrl.setValidators(format === 'in_person' ? [Validators.required] : []);
    instructionsCtrl.setValidators(format === 'phone' || format === 'custom' ? [Validators.required] : []);

    meetingLinkCtrl.updateValueAndValidity({ emitEvent: false });
    locationCtrl.updateValueAndValidity({ emitEvent: false });
    instructionsCtrl.updateValueAndValidity({ emitEvent: false });

    const preset = this.form.get('durationPreset')!.value;
    const customCtrl = this.form.get('durationCustom')!;
    customCtrl.setValidators(
      preset === 'custom' ? [Validators.required, Validators.min(15), Validators.max(240)] : []
    );
    customCtrl.updateValueAndValidity({ emitEvent: false });

    // Re-run the future-start check whenever timezone-affecting fields settle.
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  get isCustomType(): boolean {
    return this.form?.get('interviewType')!.value === this.customTypeValue;
  }

  get selectedFormat(): InterviewFormat {
    return this.form?.get('format')!.value;
  }

  get isCustomDuration(): boolean {
    return this.form?.get('durationPreset')!.value === 'custom';
  }

  get effectiveDurationMinutes(): number | null {
    const preset = this.form.get('durationPreset')!.value;
    if (preset === 'custom') {
      const v = this.form.get('durationCustom')!.value;
      return v ? Number(v) : null;
    }
    return Number(preset);
  }

  private computeStartAtIsoSafe(): string | null {
    if (!this.form) { return null; }
    const date = this.form.get('date')?.value;
    const time = this.form.get('time')?.value;
    const timezone = this.form.get('timezone')?.value;
    if (!date || !time || !timezone || !isValidTimeZone(timezone)) { return null; }
    return zonedWallTimeToUtcIso(date, time, timezone);
  }

  get formHasPastStartError(): boolean {
    return !!this.form?.hasError('startInPast') && (this.form.get('date')?.touched || this.form.get('time')?.touched);
  }

  submit(): void {
    if (this.submitting) { return; }
    this.serverErrorMessage = null;
    this.conflictError = false;
    this.form.markAllAsTouched();

    if (this.form.invalid) { return; }

    const v = this.form.value;
    let startAt: string;
    try {
      startAt = zonedWallTimeToUtcIso(v.date, v.time, v.timezone);
    } catch {
      this.serverErrorMessage = 'Please check the date, time, and timezone.';
      return;
    }

    const durationMinutes = this.effectiveDurationMinutes;
    if (!durationMinutes) { return; }

    const shared: RescheduleInterviewRequest = {
      interviewType: v.interviewType,
      customTypeLabel: v.interviewType === this.customTypeValue ? v.customTypeLabel : undefined,
      format: v.format,
      meetingLink: v.format === 'video_call' ? v.meetingLink : undefined,
      location: v.format === 'in_person' ? v.location : undefined,
      instructions: v.format === 'phone' || v.format === 'custom' ? v.instructions : undefined,
      preparationNotes: v.preparationNotes ? v.preparationNotes : undefined,
      startAt,
      durationMinutes,
      timezone: v.timezone,
    };

    this.submitting = true;

    const request$ = this.isReschedule
      ? this.interviewService.reschedule(this.data.interview!.interviewId, shared)
      : this.interviewService.create({
          ...shared,
          applicationId: this.data.applicationId!,
          idempotencyKey: this.idempotencyKey,
        } as CreateScheduledInterviewRequest);

    request$.subscribe({
      next: (res) => {
        this.submitting = false;
        this.successResult = { interview: res.interview, notificationWarning: res.notificationWarning };
      },
      error: (err) => {
        this.submitting = false;
        this.handleError(err);
      },
    });
  }

  private handleError(err: any): void {
    const status = err?.status;
    const body = err?.error;
    const code = body?.code;

    if (status === 409 && code === 'CONFLICT') {
      this.conflictError = true;
      return;
    }
    if (status === 409 && code === 'IDEMPOTENCY_CONFLICT') {
      this.serverErrorMessage = "Something went wrong submitting this request. Please close this dialog and try again with a fresh form.";
      return;
    }
    if (status === 400 && code === 'VALIDATION_ERROR') {
      this.fieldErrors = Array.isArray(body?.details) ? body.details : [];
      this.serverErrorMessage = body?.error || 'Please check the form and try again.';
      return;
    }
    if (status === 400 && code === 'INVALID_STATE_TRANSITION') {
      this.serverErrorMessage = 'This interview has already been cancelled and can no longer be rescheduled.';
      return;
    }
    if (status === 403) {
      this.serverErrorMessage = "You don't have permission to do that.";
      return;
    }
    this.serverErrorMessage = body?.error || 'Something went wrong. Please try again.';
  }

  get conflictMessage(): string { return CONFLICT_MESSAGE; }
  get conflictSubmessage(): string { return CONFLICT_SUBMESSAGE; }

  close(): void {
    this.dialogRef.close(null);
  }

  done(): void {
    this.dialogRef.close(this.successResult);
  }
}
