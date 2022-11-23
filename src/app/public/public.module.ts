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

const routes: Routes = [
  { path: '', component: PublicComponent }
]

@NgModule({
  declarations: [
    PublicComponent,
    BannerComponent,
    ExploreUsersComponent
  ],
  imports: [
    CommonModule,
    CompaniesModule,
    JobsModule,
    CoreModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class PublicModule { }
