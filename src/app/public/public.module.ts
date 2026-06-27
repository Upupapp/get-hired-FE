import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { PublicSearchComponent } from './public-search/public-search.component';
import { ApplicationModule } from '@main/application/application.module';
import { MainPortalComponent } from './main-portal/main-portal.component';
import { JobSeekerPortalComponent } from './job-seeker-portal/job-seeker-portal.component';
import { EmployerPortalComponent } from './employer-portal/employer-portal.component';
import { RoleCardComponent } from './shared/role-card/role-card.component';
import { PortalCtaBandComponent } from './shared/portal-cta-band/portal-cta-band.component';
import { PortalFaqComponent } from './shared/portal-faq/portal-faq.component';
import { JobBoardEmployerCtaComponent } from './components/job-board-employer-cta/job-board-employer-cta.component';

const routes: Routes = [
  {
    path: '',
    component: PublicComponent,
    children: [
      // `component: MainPortalComponent` directly on the empty path
      // never activated, in EITHER array position, with or without a
      // guard -- confirmed empirically across multiple attempts, while
      // every non-empty literal path in this exact same array (/jobs,
      // /employers, /job-seekers) renders correctly every time. Rather
      // than keep fighting this specific Angular Router matching
      // behavior, the bare path now redirects to a named, non-empty path
      // ('home'), which uses the exact same plain-literal-path matching
      // mechanism already proven reliable for every other route here.
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: MainPortalComponent },
      { path: 'jobs/details/:id', component: PublicDetailsComponent },
      { path: 'jobs', component: PublicListComponent },
      { path: 'jobs/search/:keyword', component: PublicSearchComponent },
      {
        path: 'companies',
        loadChildren: () => import('@main/companies/companies.module').then(m => m.CompaniesModule),
      },
      // GETHIRED PORTAL v2: the main URL now hosts a dedicated
      // role-selection portal instead of redirecting straight to /jobs.
      // /jobs itself is completely unchanged and still works exactly as
      // before -- this only changes what a visitor sees at the bare root.
      { path: 'job-seekers', component: JobSeekerPortalComponent },
      { path: 'employers', component: EmployerPortalComponent },
    ]
  }
]

@NgModule({
  declarations: [
    PublicComponent,
    BannerComponent,
    ExploreUsersComponent,
    PublicListComponent,
    PublicDetailsComponent,
    PublicSearchComponent,
    MainPortalComponent,
    JobSeekerPortalComponent,
    EmployerPortalComponent,
    RoleCardComponent,
    PortalCtaBandComponent,
    PortalFaqComponent,
    JobBoardEmployerCtaComponent
  ],
  imports: [
    // RouterModule MUST be first so public routes (/home, /jobs, etc.) are
    // registered before CompaniesModule's forChild routes (which include
    // { path: ':slug' } at the public level due to eager-import merging).
    // Angular collects ROUTES multi-providers in import order; first match wins.
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    CompaniesModule,
    JobsModule,
    CoreModule,
    SharedModule,
    ApplicationModule,
  ], providers: [JobFacade]
})
export class PublicModule { }
