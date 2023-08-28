import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Subject, map, takeUntil, tap } from 'rxjs';
import { CreateQuestionComponent } from '../create-question/create-question.component';
import { CreateNewTemplateDialogComponent } from '@main/employer-panel/employer-interview/pages/add-interview-templates/components/create-new-template-dialog/create-new-template-dialog.component';
import { InterviewFacade } from '../state/interview.facade';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CreateInterviewComponent } from '../create-interview/create-interview.component';

@Component({
  selector: 'app-create-group-interview',
  templateUrl: './create-group-interview.component.html',
  styleUrls: ['./create-group-interview.component.scss'],
  animations: [mainAnimations]
})
export class CreateGroupInterviewComponent implements OnInit {
  @Output() cancel = new EventEmitter();
  @Output() next = new EventEmitter();
  @Output() newTemplateInterview = new EventEmitter();

  templateForm!: FormGroup;
  loading: boolean = true;
  companyId: string;
  searchInGroups: string;
  searchInIndividual: string;
  searchInApplicant: string;

  selectAllEmail: boolean = false;
  selectAllGroup: boolean = false;
  selectAllIndividual: boolean = false;

  selectedIndividuals: string[] = [];
  selectedApplicants: string[] = [];
  selectedGroups = [];


  // groupContact = [];
  // individualEmails = [];
  // emailByJobPost = [];
  allRecipientObj: any;
  jobLists = [] // TODO get job list
  private unsubscribe$ = new Subject<void>();

  loading$ = this.interviewFacade.loading$.pipe().subscribe(this.onLoad.bind(this));
  list$ = this.interviewFacade.interviewTemplatesList$
    .pipe(
      map(templates => {
        return templates.map(template => {
          return {
            name: template.jobInterviewTemplateName,
            value: template.jobInterviewTemplateId
          }
        })
      })
    );

  recipients$ = this.interviewFacade.interviewRecipientList$
    .pipe(
      tap(recipients => {
        if (recipients) {
          // this.groupContact = recipients.groupContact;
          // this.individualEmails = recipients.individualEmails;
          // this.emailByJobPost = recipients.emailByJobPost;
          this.allRecipientObj = {
            groupContact: recipients.groupContact,
            individualEmails: recipients.individualEmails,
            emailByJobPost: recipients.emailByJobPost
          }
        }
      })
    );

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private interviewFacade: InterviewFacade
  ) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user.companyId) {
      this.companyId = user.companyId;
      this.interviewFacade.getInterviewTemplatesList(user.companyId);
      this.interviewFacade.getInterviewRecipientList(user.companyId);
    }

    this.templateForm = this.formBuilder.group({
      groupInterviewName: [null, Validators.required],
      jobId: [null],
      externalJobLink: [null],
      interviewTemplateQuestion: [null, Validators.required]
    });
  }

  searchDataSource(arr, searchModel, key?): any[] {
    if (!searchModel || searchModel == '') {
      return this.allRecipientObj[arr];
    } else {
      return this.allRecipientObj[arr].filter((item) => {
        return key ? item[key].toLowerCase().includes(searchModel.toLowerCase()) : item.toLowerCase().includes(searchModel.toLowerCase());
      });
    }

  }

  createNewTemplateInterview() {
    this.newTemplateInterview.emit()
  }

  onLoad(isLoading: boolean) {
    this.loading = isLoading;
  }

  // selectAll(arr, selection) {
  //   return arr.forEach((el) => {
  //     el.selected = selection;
  //   });
  // }

  selectAll(arr, selection, event) {
    if(event.target.checked) {
      this[selection] = arr;
    } else {
      this[selection] = [];
    }
  }

  getApplicantEmails(event, applicant) {
    const isSelected = event.target.checked;
    if (isSelected) {
      this.selectedApplicants.push(applicant.email);
    } else {
      this.selectedApplicants = this.selectedApplicants.filter(email => email != applicant.email)
    }

    console.log(this.selectedApplicants);
  }

  getIndividualEmails(event, individual) {
    const isSelected = event.target.checked;
    if (isSelected) {
      this.selectedIndividuals.push(individual.email);
    } else {
      this.selectedIndividuals = this.selectedIndividuals.filter(email => email != individual.email)
    }

    console.log(this.selectedIndividuals)
  }

  getGroupsEmails(event, group) {
    const isSelected = event.target.checked;
    if (isSelected) {
      this.selectedGroups.push(group);
    } else {
      this.selectedGroups = this.selectedGroups.filter(selectedGroup => selectedGroup.group_id != group.group_id)
    }

    console.log(this.selectedGroups)
  }

  submitInterview() {
    if (this.templateForm.valid) {
      const { name, value } = this.templateForm.controls.interviewTemplateQuestion?.value;

      const flattenRecipient = this.getFlattenRecipient();


      this.next.emit({
        ...this.templateForm.value,
        companyId: this.companyId,
        interviewTemplateQuestionName: name,
        interviewTemplateQuestionId: value,
        recipients: flattenRecipient,
        groups: this.selectedGroups
      })
    } else {
      this.templateForm.markAllAsTouched();
    }
  }

  getFlattenRecipient() {
    let allEmails = [];
    if (this.selectAllEmail) {
      allEmails.push(...this.allRecipientObj.emailByJobPost);
    } else {
      allEmails.push(...this.selectedApplicants)
    }

    if (this.selectAllIndividual) {
      allEmails.push(...this.allRecipientObj.individualEmails);
    } else {
      allEmails.push(...this.selectedIndividuals)
    }

    return allEmails;
  }

  isChecked(item, arr, key?) {
    return key ? arr.includes(item[key]) : arr.includes(item);
  }

  getBack() {
    this.cancel.emit();
  }

  get groupInterviewName_validators() {
    return this.templateForm.get('groupInterviewName');
  }

  get interviewTemplateQuestion_validators() {
    return this.templateForm.get('interviewTemplateQuestion');
  }

}
