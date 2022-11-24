import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicComponent } from './public.component';
import { RouterModule, Routes } from '@angular/router';
import { CompaniesModule } from '@main/companies/companies.module';
import { SharedModule } from '@app-shared/shared.module';
import { CoreModule } from '@app-core/core.module';
import { BannerComponent } from './components/banner/banner.component';
import { ExploreUsersComponent } from './components/explore-users/explore-users.component';
import { JobsModule } from '@main/jobs/jobs.module';
import { PublicListComponent } from './public-list/public-list.component';
import { PublicDetailsComponent } from './public-details/public-details.component';
import { JobFacade } from '@app-job/state/job.facade';

const routes: Routes = [
  {
    path: '',
    component: PublicComponent,
    children: [
      { path: 'jobs/details/:id', component: PublicDetailsComponent },
      { path: 'jobs', component: PublicListComponent },
      {
        path: 'companies',
        loadChildren: () => import('@main/companies/companies.module').then(m => m.CompaniesModule),
      },
      { path: '', redirectTo: 'jobs', pathMatch: 'full' }
    ]
  }
]

@NgModule({
  declarations: [
    PublicComponent,
    BannerComponent,
    ExploreUsersComponent,
    PublicListComponent,
    PublicDetailsComponent
  ],
  imports: [
    CommonModule,
    CompaniesModule,
    JobsModule,
    CoreModule,
    SharedModule,
    RouterModule.forChild(routes)
  ], providers: [JobFacade]
})
export class PublicModule { }
