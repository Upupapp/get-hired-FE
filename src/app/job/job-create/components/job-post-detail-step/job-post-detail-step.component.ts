import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { JobFacade } from '@app-job/state/job.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from '@app-job/job.model';
import { SnackbarService } from '@app-core/services/snackbar.service';

@Component({
  selector: 'app-job-post-detail-step',
  animations: [mainAnimations],
  templateUrl: './job-post-detail-step.component.html',
  styleUrls: ['./job-post-detail-step.component.scss']
})
export class JobPostDetailStepComponent implements OnInit {
  @Input() formGroupName: string;
  /** BANNER-RACE FIX: relays app-gh-image-upload's own (uploading) lifecycle
   *  event up to job-create.component.ts, which owns the autosave timer.
   *  Without this, a background autosave firing mid-upload persists
   *  whatever jobBanner value the form already had -- the previous banner,
   *  or the shared default placeholder for a job that never had one --
   *  because onBannerUploaded() (below) hasn't set the real URL yet. See
   *  GETHIRED_OVERLAY_BANNER_AUDIT for the reproduced request-ordering
   *  evidence. */
  @Output() bannerUploadPending = new EventEmitter<boolean>();
  /** Simplified Job-Post mode (see job-post-mode-dialog): hides secondary/detail
   *  sections in the template below. Purely a display flag -- the underlying
   *  form model and its controls are untouched, so nothing here changes what
   *  gets submitted; hidden fields just stay empty/default. */
  @Input() simplified: boolean = false;
  /** True only for jobs reached via the AI Assistant's "Review & edit
   *  first" -- that flow requires Work setup (not City/Country) for Step
   *  1, the opposite of every other mode (job-create.component.ts's
   *  setFormGroup() attaches the actual validators). Display-only here. */
  @Input() assistantPrefilled: boolean = false;

  initialDetailsForm: FormGroup;
  workSetupSelected: number;
  badges: FormArray;
  badgeSelected = [];
  requirements: FormArray;
  goodToHave: FormArray;
  educationalBackground: FormArray;
  certificationRequirements: FormArray;
  bannerSelected: FormArray;
  bannerUrl: string;

  certificationTypes = ['certification', 'license', 'permit', 'eligibility', 'other'];

  workSetup$ = this.jobFacade.setup$;
  private workSetupItems: any[] = [];
  typeList$ = this.jobFacade.typeList$;
  level$ = this.jobFacade.level$;
  badge$ = this.jobFacade.badge$;
  category$ = this.jobFacade.category$;

  constructor(
    private rootFormGroup: FormGroupDirective,
    private jobFacade: JobFacade,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.populateOptions();
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    this.initialDetailsForm = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
    this.badges = this.initialDetailsForm.get('badges') as FormArray;
    this.requirements = this.initialDetailsForm.get('requirements') as FormArray;
    this.goodToHave = this.initialDetailsForm.get('goodToHave') as FormArray;
    this.educationalBackground = this.initialDetailsForm.get('educationalBackground') as FormArray;
    this.certificationRequirements = this.initialDetailsForm.get('certificationRequirements') as FormArray;
    this.bannerSelected = this.initialDetailsForm.get('bannerFile') as FormArray;
    this.workSetupSelected = this.initialDetailsForm.get('workSetupId').value;
    this.bannerUrl = this.initialDetailsForm.get('jobBanner').value;
    this.workSetup$.subscribe(items => { if (items) this.workSetupItems = items; });

    // Revalidate work-setup badges if the recruiter changes the work setup
    this.initialDetailsForm.get('workSetupId').valueChanges.subscribe(val => {
      this.workSetupSelected = val;
      this.revalidateWorkSetupBadges();
    });
  }

  populateOptions() {
    this.jobFacade.getType();
    this.jobFacade.getLevel();
    this.jobFacade.getSetup();
    this.jobFacade.getBadge();
    this.jobFacade.getCategory();
  }

  onBannerUploaded(result: any): void {
    this.bannerUrl = result.primaryUrl;
    this.initialDetailsForm.get('jobBanner').setValue(result.primaryUrl);
    this.bannerSelected.clear();
  }

  onBannerClear(): void {
    this.bannerUrl = null;
    this.initialDetailsForm.get('jobBanner').setValue(null);
    this.bannerSelected.clear();
  }

  /** BANNER-RACE FIX: app-gh-image-upload emits this true the instant a
   *  banner upload starts and false once it resolves (success, error, or
   *  clear) -- see its own doc comment. Relayed unchanged to the parent. */
  onBannerUploading(isUploading: boolean): void {
    this.bannerUploadPending.emit(isUploading);
  }

  selectWorkSetUp(chosen) {
    this.workSetupSelected = chosen;
    this.initialDetailsForm.controls.workSetupId.setValue(chosen);
  }

  get workSetupHelperText(): string {
    const item = this.workSetupItems.find(i => i.id === this.workSetupSelected);
    if (!item) return '';
    const n = (item.name || '').toLowerCase();
    if (n.includes('remote'))  return 'Work can be done remotely from any location.';
    if (n.includes('hybrid'))  return 'Mix of office and remote work.';
    if (n.includes('on-site') || n.includes('onsite')) return 'Work happens at a company location.';
    return item.name ? item.name + ' work arrangement.' : '';
  }

  // Work-setup badge IDs — mutually exclusive
  private readonly WS_BADGE_IDS = [1, 2, 3];

  isBadgeSelected(badgeId: number): boolean {
    return this.badges && this.badges.value.some((b: any) => b.id === badgeId);
  }

  isBadgeEligible(badge: any): boolean {
    const ws = this.workSetupSelected;
    if (badge.id === 1) return ws === 2; // Remote-Friendly → Remote
    if (badge.id === 2) return ws === 3; // Hybrid Work → Hybrid
    if (badge.id === 3) return ws === 1; // Onsite Collaboration → On-site
    if (badge.id === 4) {                // Salary Posted → salary filled
      const sal = this.initialDetailsForm && this.initialDetailsForm.get('salaryMinimum');
      return !!(sal && sal.value);
    }
    return true; // badges 5-10: recruiter attestation, always eligible
  }

  getBadgeIneligibleReason(badge: any): string {
    const ws = this.workSetupSelected;
    if (badge.id === 1 && ws !== 2) return 'Set work setup to "Remote" to use this badge.';
    if (badge.id === 2 && ws !== 3) return 'Set work setup to "Hybrid" to use this badge.';
    if (badge.id === 3 && ws !== 1) return 'Set work setup to "On-site" to use this badge.';
    if (badge.id === 4) {
      const sal = this.initialDetailsForm && this.initialDetailsForm.get('salaryMinimum');
      if (!(sal && sal.value)) return 'Add a salary amount to use this badge.';
    }
    return '';
  }

  addBadge(item: any) {
    // Toggle off if already selected
    const existingIdx = this.badges.value.findIndex((b: any) => b.id === item.id);
    if (existingIdx !== -1) {
      this.removeItem(existingIdx, this.badges);
      return;
    }
    if (!this.isBadgeEligible(item)) {
      this.snackbarService.warning(this.getBadgeIneligibleReason(item), '');
      return;
    }
    if (this.badges.controls.length >= 3) {
      this.snackbarService.warning('You can select up to 3 badges.', '');
      return;
    }
    // Mutual exclusivity: remove existing work-setup badge before adding another
    if (this.WS_BADGE_IDS.includes(item.id)) {
      const existingWsIdx = this.badges.value.findIndex((b: any) => this.WS_BADGE_IDS.includes(b.id));
      if (existingWsIdx !== -1) this.removeItem(existingWsIdx, this.badges);
    }
    this.badges.push(new FormGroup({
      icon: new FormControl(item.icon),
      name: new FormControl(item.name),
      id: new FormControl(item.id)
    }));
  }

  private revalidateWorkSetupBadges() {
    for (let i = (this.badges.controls.length - 1); i >= 0; i--) {
      const b = this.badges.value[i];
      if (this.WS_BADGE_IDS.includes(b.id) && !this.isBadgeEligible(b)) {
        this.removeItem(i, this.badges);
      }
    }
  }



  addItem(control, controlArray: FormArray) {
    let value = this.initialDetailsForm.get(control).value;

    if (value && value != '') {
      if (controlArray.controls.length != 5) {
        controlArray.push(new FormControl(value));
        this.initialDetailsForm.controls[control].setValue(null);
      } else {
        this.snackbarService.warning(`You are only allowed to add up to 5 items to this category`, '');
      }
    } else {
      this.snackbarService.warning(`Empty string not allowed`, '');
    }
  }

  removeItem(index: number, controlArray: FormArray) {
    controlArray.removeAt(index);
  }

  // GETHIRED JOB CERTIFICATION REQUIREMENTS v1 -- structured items need
  // their own add/remove (a FormGroup per item, not a single string
  // value like addItem/removeItem above). Required validation applies
  // only to the requirement name, per the command's explicit scope --
  // every other field is optional so a minimal entry never produces a
  // broken payload.
  addCertificationRequirement() {
    if (this.certificationRequirements.length >= 10) {
      this.snackbarService.warning(`You are only allowed to add up to 10 certification/license requirements`, '');
      return;
    }
    this.certificationRequirements.push(new FormGroup({
      id: new FormControl(null),
      name: new FormControl(null, Validators.required),
      type: new FormControl('certification'),
      importance: new FormControl('required'),
      issuingAuthority: new FormControl(null),
      expiryRequired: new FormControl(false),
      verificationRequired: new FormControl(false),
    }));
  }

  removeCertificationRequirement(index: number) {
    this.certificationRequirements.removeAt(index);
  }

}
