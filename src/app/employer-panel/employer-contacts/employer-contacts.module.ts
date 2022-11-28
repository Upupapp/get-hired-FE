import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployerContactsComponent } from './employer-contacts.component';
import { RouterModule, Routes } from '@angular/router';
import { ContactListComponent } from './contact-list/contact-list.component';
import { CandidateListComponent } from './candidate-list/candidate-list.component';
import { ImportAddContactComponent } from './contact-list/dialogs/import-add-contact/import-add-contact.component';
import { SharedModule } from '@app-shared/shared.module';
import { ImportAddCandidateComponent } from './candidate-list/dialogs/import-add-candidate/import-add-candidate.component';

const routes: Routes = [
  {
    path: '',
    component: EmployerContactsComponent,
    children: [
      { path: 'list', component: ContactListComponent },
      { path: 'candidates', component: CandidateListComponent },
      { path: '', redirectTo: 'list', pathMatch: 'full' }
    ]
  }

]

@NgModule({
  declarations: [
    EmployerContactsComponent,
    ContactListComponent,
    CandidateListComponent,
    ImportAddContactComponent,
    ImportAddCandidateComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class EmployerContactsModule { }
