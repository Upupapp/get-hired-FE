import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroupDirective } from '@angular/forms';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { CvBuilderService } from '@app-applicant/cv-builder/cv-builder.service';

@Component({
  selector: 'app-profile-documents',
  animations: [mainAnimations],
  templateUrl: './profile-documents.component.html',
  styleUrls: ['./profile-documents.component.scss']
})
export class ProfileDocumentsComponent implements OnInit {
  @Input() formGroupName: string;

  // Pre-fills each field's visible chip list -- passed to
  // app-file-upload-document via [fileArray]. This step's component gets
  // destroyed and recreated every time the applicant navigates away from
  // and back to Step 2 (the parent only keeps it in the DOM via
  // *ngIf="stepper === 2"), so ngOnInit runs again on every return visit.
  //
  // BUGFIX: these used to start empty on every (re)mount, with no attempt
  // to read back whatever the applicant had already uploaded THIS SESSION
  // -- that data was never actually lost (docCover/docResume/docGovFile
  // are FormArrays on the parent applicationForm, which never gets
  // destroyed), only the visual chip list the applicant sees was reset to
  // empty, making it look like the files vanished. Cover Letter and
  // Government Files additionally never had a [fileArray] binding in the
  // template at all -- always empty regardless. Now every field seeds
  // itself from its own FormArray's current value first.
  resumeFileArray: any[] = [];
  coverFileArray: any[] = [];
  govFileArray: any[] = [];

  constructor(
    private rootFormGroup: FormGroupDirective,
    private fb: FormBuilder,
    private cvBuilderService: CvBuilderService,
  ) { }

  ngOnInit(): void {
    // Re-seed from whatever this session already has on the persisted
    // FormArrays before considering any further pre-fill -- this is what
    // makes files survive a Next/Previous round trip back to this step.
    this.coverFileArray = [...(this.docCover.value || [])];
    this.govFileArray = [...(this.docGovFile.value || [])];
    this.resumeFileArray = [...(this.docResume.value || [])];

    // Resume pre-fill: only when the applicant hasn't already attached a
    // resume this session (either manually, or from an earlier mount of
    // this same step) -- otherwise this would silently overwrite their
    // manual upload/removal with the profile default on every return visit
    // to this step. If the applicant already has a CV on file from profile
    // setup (GET /cv-builder/current, the is_cv=true row), use it as the
    // Resume attachment for this application by default instead of leaving
    // the field empty and forcing a redundant re-upload. If none exists,
    // the field stays genuinely empty and requires an upload, as it
    // already did.
    if (this.resumeFileArray.length > 0) return;

    this.cvBuilderService.getCurrentCv().subscribe({
      next: (res: any) => {
        const cv = res?.data;
        if (!cv) return;
        // Guard against a second CV-fetch response racing back after the
        // applicant already manually attached a resume in the meantime.
        if (this.resumeFileArray.length > 0) return;

        const resumeDoc = {
          // No `file` (no new blob to upload) -- fileurl alone tells the
          // backend to reuse the existing storage object rather than
          // uploading a duplicate copy of the same file.
          file: null,
          filename: cv.filename,
          size: cv.size,
          type: cv.type,
          fileurl: cv.fileurl,
          created_at: cv.created_at,
        };
        this.resumeFileArray = [resumeDoc];
        this.mappedOutToControl([resumeDoc], this.docResume);
      },
      error: () => {
        // Non-fatal: leave the Resume field empty, same as an applicant
        // with no CV on file -- this is a convenience pre-fill, not a
        // required step.
      },
    });
  }

  get docGovFile() {
    return this.rootFormGroup.control.get([this.formGroupName, 'governmentFiles']) as FormArray;
  }

  get docResume() {
    return this.rootFormGroup.control.get([this.formGroupName, 'resume']) as FormArray;
  }

  get docCover() {
    return this.rootFormGroup.control.get([this.formGroupName, 'coverLetter']) as FormArray;
  }

  getGovFile(item) {
    console.log(item);
    this.mappedOutToControl(item, this.docGovFile);
  }

  getResume(item) {
    console.log(item);
    this.mappedOutToControl(item, this.docResume);
  }

  getCover(item) {
    console.log(item);
    this.mappedOutToControl(item, this.docCover);
  }

  mappedOutToControl(docs, formArray: FormArray) {
    formArray.reset();
    console.log(docs);

    const array = docs.map(item => {
      return this.fb.group({
        file: new FormControl(item.file),
        filename: new FormControl(item.filename),
        size: new FormControl(item.size),
        type: new FormControl(item.type),
        fileurl: new FormControl(item.fileurl || ''),
        created_at: new FormControl(item.created_at || null)
      })
    });

    const mappingDoc = docs.map(doc => {
      return {
        ...doc,
        fileurl: doc.fileurl || null,
        created_at: doc.created_at || null
      }
    })

    console.log(array);
    formArray.controls = array;
    formArray.setValue(mappingDoc);

    console.log(formArray)
  }
}
