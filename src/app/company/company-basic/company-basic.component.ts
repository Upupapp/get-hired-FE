import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CompanyFacade } from '@app-company/state/company.facade';

@Component({
  selector: 'app-company-basic',
  templateUrl: './company-basic.component.html',
  styleUrls: ['./company-basic.component.scss']
})
export class CompanyBasicComponent implements OnInit {
  companyBasicForm: FormGroup;
  submitting: boolean;
  error: any;

  success$ = this.companyFacade.success$
    .pipe()
    .subscribe(this.afterSubmit.bind(this));


  errorMsg$ = this.companyFacade.error$
    .pipe()
    .subscribe(this.onError.bind(this));

  constructor(
    private fb: FormBuilder,
    private companyFacade: CompanyFacade,
    public dialogRef: MatDialogRef<CompanyBasicComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) { }

  ngOnInit(): void {
    this.companyBasicForm = this.fb.group({
      companyName: [null, Validators.required],
      companyEmail: [null, [Validators.email, Validators.required]]
    });
  }

  onSubmit() {
    this.submitting = true;

    if (this.companyBasicForm.valid) {
      const {
        companyName, companyEmail
      } = this.companyBasicForm.value;

      this.companyFacade.createInitialCompany(companyName, companyEmail)
    }
  }

  afterSubmit(event) {
    this.submitting = false;

    if (event == 'created') {
      this.dialogRef.close(1)
    }
  }

  onError(err: any) {
    console.log(err);
    if (err) {
      this.submitting = false;
      window.scroll(0, 0);
      this.error = err;
    }
  }


  // Clear error message
  onAlertClose(): void {
    this.error = undefined;
  }

  get companyEmail_validators() {
    return this.companyBasicForm.get('companyEmail');
  }

  get companyName_validators() {
    return this.companyBasicForm.get('companyName');
  }

}
