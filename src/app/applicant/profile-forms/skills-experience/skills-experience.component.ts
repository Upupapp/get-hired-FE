import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';
import { LoadingComponent } from '@app-shared/components/loading/loading.component';
import { Subscription } from 'rxjs';
import * as Model from '../../applicant.model';
import { AwardsComponent } from './awards/awards.component';
import { EducationalBackgroundComponent } from './educational-background/educational-background.component';
import { WorkExperienceComponent } from './work-experience/work-experience.component';

@Component({
  selector: 'app-skills-experience',
  templateUrl: './skills-experience.component.html',
  styleUrls: ['./skills-experience.component.scss'],
  animations: [mainAnimations]
})
export class SkillsExperienceComponent implements OnInit {
  @Input() user: any;
  @Input() applicantProfileId: string;

  confirmation$: Subscription;
  loading$ = this.applicantFacade.loading$
    .pipe().subscribe(this.formLoading.bind(this));

  skillsAndExperience$ = this.applicantFacade.additionalInfo$
    .pipe().subscribe(this.fillUpArrays.bind(this));

  success$ = this.applicantFacade.success$
    .pipe().subscribe(this.afterSubmit.bind(this))

  forChange = [];
  skillsFG: FormGroup
  professionalSkills: string[];
  skillChanged: boolean;

  workExperience: Model.WorkExperience[];
  educationalBackground: Model.EducationalBackground[];
  certifications: Model.Certifications[];

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private applicantFacade: ApplicantFacade,
    private snackbarService: SnackbarService,
    private loadingDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.skillsFG = this.fb.group({
      skillsTxt: [null, Validators.required]
    });
  }

  /**
   * PROFILE-SETUP PHASE 1 (Skills hardening): previously pushed the raw
   * control value unconditionally -- a blank/whitespace-only entry (the
   * required validator on skillsTxt was never actually checked here) or an
   * exact duplicate of an existing skill could both be added. Trims,
   * rejects blank, and rejects an exact duplicate (case-insensitive,
   * trimmed comparison) before pushing. Data shape/API unchanged --
   * professionalSkills stays a plain string[].
   */
  addSkills() {
    const raw = this.skillsFG.controls['skillsTxt'].value;
    const trimmed = typeof raw === 'string' ? raw.trim() : '';
    if (!trimmed) {
      this.skillsFG.controls['skillsTxt'].reset();
      return;
    }
    const isDuplicate = (this.professionalSkills || []).some(
      (s) => typeof s === 'string' && s.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      this.snackbarService.error('This skill is already in your list.', '', 3000);
      this.skillsFG.controls['skillsTxt'].reset();
      return;
    }
    this.professionalSkills.push(trimmed);
    this.skillsFG.controls['skillsTxt'].reset();
    this.skillChanged = true;
  }

  addWorkExperience(index?: number) {
    const ref = this.dialog.open(WorkExperienceComponent, {
      width: '70vw',
      data: index >= 0 ? {...this.workExperience[index]} : null
    });

    ref.afterClosed().subscribe(res => {
      if (res) {
        if(index >= 0) {
          this.workExperience = [...this.workExperience.map((work, i) => {
            if(i == index) {
              return res;
            } else {
              return work;
            }
          })];
        } else {
          this.workExperience.push(res);
        }
        this.submitArray('workExperience');
      }
    });
  }

  addEducBg(index?: number) {
    const ref = this.dialog.open(EducationalBackgroundComponent, {
      width: '70vw',
      data: index >= 0 ? {...this.educationalBackground[index]} : null
    });

    ref.afterClosed().subscribe(res => {
      if (res) {
        if(index >= 0) {
          this.educationalBackground = [...this.educationalBackground.map((educ, i) => {
            if(i == index) {
              return res;
            } else {
              return educ;
            }
          })];
        } else {
          this.educationalBackground.push(res);
        }
        this.submitArray('educBackground');
      }
    });
  }

  addCertAndAwards(index?: number) {
    const ref = this.dialog.open(AwardsComponent, {
      width: '70vw',
      data: index >= 0 ? {...this.certifications[index] }: null
    });

    ref.afterClosed().subscribe(res => {
      if (res) {
        if(index >= 0) {
          this.certifications = [...this.certifications.map((cert, i) => {
            if(i == index) {
              return res;
            } else {
              return cert;
            }
          })];
        } else {
          this.certifications.push(res);
        }
        this.submitArray('certifications');
      }
    });
  }

  updateArray(index: number, arrayName: string) {
    console.log(index);
    switch (arrayName) {
      case 'certifications':
        this.addCertAndAwards(index);
        break;
      case 'workExperience':
        this.addWorkExperience(index);
        break;
      case 'educBackground':
        this.addEducBg(index);
        break;
    }
  }

  confirm(index: number, arrayName: string) {
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        action: `Delete`,
      },
    });

    this.confirmation$ = ref
      .afterClosed()
      .pipe()
      .subscribe((result) => {
        if (result == 1) {
          this.removeItem(index, arrayName)
        }
      });
  }

  removeItem(index: number, arrayName: string) {
    switch (arrayName) {
      case 'professionalSkills':
        this.professionalSkills = this.professionalSkills.filter((skill, i) => i != index);
        this.skillChanged = true;
        break;
      case 'certifications':
        this.certifications = this.certifications.filter((cert, i) => i != index);
        break;
      case 'workExperience':
        this.workExperience = this.workExperience.filter((work, i) => i != index);
        break;
      case 'educBackground':
        this.educationalBackground = this.educationalBackground.filter((educ, i) => i != index);
        break;
    }

    this.submitArray(arrayName);

  }

  submitArray(item: string) {
    switch (item) {
      case 'certifications':
        this.applicantFacade.saveCert(this.certifications, this.applicantProfileId);
        break;
      case 'workExperience':
        this.applicantFacade.saveWorkExperience(this.workExperience, this.applicantProfileId);
        break;
      case 'educBackground':
        this.applicantFacade.saveEducBg(this.educationalBackground, this.applicantProfileId);
        break;
    }
  }

  submitSkills() {
    this.applicantFacade.saveSkills(this.professionalSkills, this.applicantProfileId);
    this.skillChanged = false;
  }

  afterSubmit(event) {
    if (event == 'updated') {
      this.snackbarService.success(`Profile successfully updated`, '');
    }
  }

  fillUpArrays(data) {
    console.log(data);
    if (data) {
      if (data.professionalSkills) {
        this.professionalSkills = [...data.professionalSkills]
      } else {
        this.professionalSkills = [];
      }

      if (data.workExperience) {
        this.workExperience = [...data.workExperience]
      } else {
        this.workExperience = [];
      }

      if (data.educationalBackground) {
        this.educationalBackground = [...data.educationalBackground]
      } else {
        this.educationalBackground = [];
      }

      if (data.certifications) {
        this.certifications = [...data.certifications]
      } else {
        this.certifications = [];
      }
    }
  }

  showButton(status, index) {
    this.forChange[index] = status;
  }

  formLoading(loading: boolean) {
    if (loading) {
      const ref = this.loadingDialog.open(LoadingComponent, {
        disableClose: true,
        data: {
          selfClose: false
        }
      });
    } else {
      setTimeout(() => this.loadingDialog.closeAll(), 3000);
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.success$) {
      this.success$.unsubscribe();
    }

    if (this.skillsAndExperience$) {
      this.skillsAndExperience$.unsubscribe();
    }

    if (this.loading$) {
      this.formLoading(false);
      this.loading$.unsubscribe();
    }
  }

}
