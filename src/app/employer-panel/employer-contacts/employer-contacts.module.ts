import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployerContactsComponent } from './employer-contacts.component';
import { RouterModule, Routes } from '@angular/router';
import { ContactListComponent } from './contact-list/contact-list.component';
import { CandidateListComponent } from './candidate-list/candidate-list.component';
import { ImportAddContactComponent } from './contact-list/dialogs/import-add-contact/import-add-contact.component';
import { SharedModule } from '@app-shared/shared.module';
import { ImportAddCandidateComponent } from './candidate-list/dialogs/import-add-candidate/import-add-candidate.component';
import { ContactGroupComponent } from './contact-group/contact-group.component';
import { AddContactGroupComponent } from './contact-group/dialogs/add-contact-group/add-contact-group.component';
import { CheckboxGroupComponent}  from './contact-group/dialogs/add-contact-group/checkbox-group.component'
import { CheckboxComponent}  from './contact-group/dialogs/add-contact-group/checkbox.component';
import { JobListComponent } from './job-list/job-list.component';
import { TableControlModalComponent } from './candidate-list/dialogs/table-control-modal/table-control-modal.component'
import { ApplicantModule } from '@app-applicant/applicant.module';
import { ApplicationModule } from '@app-application/application.module';
import { GroupListComponent } from './group-list/group-list.component';
import { CandidateGroupOverviewComponent } from './candidate-group/candidate-group-overview.component';
import { CandidateGroupDetailComponent } from './candidate-group/candidate-group-detail.component';

const routes: Routes = [
  {
    path: '',
    component: EmployerContactsComponent,
    children: [
      { path: 'list', component: ContactListComponent },
      { path: 'candidates', component: JobListComponent },
      { path: 'candidate-list/:id', component: CandidateListComponent },
      { path: 'groups', component: ContactGroupComponent },
      { path: 'group-list/:id', component: GroupListComponent },
      // CANDIDATE-GROUP-V1: new job-derived Candidate Group feature --
      // replaces Talent Pool/old Applicants/old manual Candidate Groups
      // in the sidebar (all three routes above are left registered,
      // unlinked, not deleted). See candidate-group-overview/-detail
      // components.
      { path: 'job-groups', component: CandidateGroupOverviewComponent },
      { path: 'job-groups/:id', component: CandidateGroupDetailComponent },
      { path: '', redirectTo: 'job-groups', pathMatch: 'full' }
    ]
  }

]

@NgModule({
  declarations: [
    EmployerContactsComponent,
    ContactListComponent,
    CandidateListComponent,
    ImportAddContactComponent,
    ImportAddCandidateComponent,
    ContactGroupComponent,
    AddContactGroupComponent,
    CheckboxComponent,
    CheckboxGroupComponent,
    JobListComponent,
    TableControlModalComponent,
    GroupListComponent,
    CandidateGroupOverviewComponent,
    CandidateGroupDetailComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ApplicantModule,
    ApplicationModule,
    RouterModule.forChild(routes)
  ]
})
export class EmployerContactsModule { }
