import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroupDirective } from '@angular/forms';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-profile-documents',
  animations: [mainAnimations],
  templateUrl: './profile-documents.component.html',
  styleUrls: ['./profile-documents.component.scss']
})
export class ProfileDocumentsComponent implements OnInit {
  @Input() formGroupName: string;

  constructor(
    private rootFormGroup: FormGroupDirective,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {

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
