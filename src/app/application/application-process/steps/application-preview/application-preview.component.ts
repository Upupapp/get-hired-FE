import { Component, Input, OnInit } from '@angular/core';
import { FormGroupDirective, FormArray } from '@angular/forms';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-application-preview',
  animations: [mainAnimations],
  templateUrl: './application-preview.component.html',
  styleUrls: ['./application-preview.component.scss']
})
export class ApplicationPreviewComponent implements OnInit {
  @Input() profile: any;
  govFiles = [];
  resume = [];
  coverLetter = [];

  public profileSummary: boolean = true;

  constructor(
    private rootFormGroup: FormGroupDirective,
  ) { }

  get docGovFile() {
    return this.rootFormGroup.control.get(['profileDocs', 'governmentFiles']) as FormArray;
  }

  get docResume() {
    return this.rootFormGroup.control.get(['profileDocs', 'resume']) as FormArray;
  }

  get docCover() {
    return this.rootFormGroup.control.get(['profileDocs', 'coverLetter']) as FormArray;
  }

  ngOnInit(): void {
    this.govFiles = this.docGovFile.value;
    this.resume = this.docResume.value;
    this.coverLetter = this.docCover.value;
  }

  viewMore(){
    this.profileSummary = !this.profileSummary
  }
}
