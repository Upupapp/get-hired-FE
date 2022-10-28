import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

const rootRouterConfig: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin-panel/admin-panel.module').then(m => m.AdminPanelModule),
    data: {
      withNav: false
    }
  },
  {
    path: '',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    data: {
      withNav: false
    }
  },
  // {
  //   path: '',
  //   redirectTo: 'job-post',
  //   pathMatch: 'full'
  // },
  // {
  //   path: '',
  //   component: HeaderComponent,
  //   children: [
  //     {
  //       path: 'job-post',
  //       loadChildren: () => import('./views/home/home.module').then(m => m.HomeModule)
  //     }
  //   ]
  // },

  // {
  //   path: '',
  //   children: [
  //     {
  //       path: '',
  //       loadChildren: () => import('./views/auth/applicant/applicant.module').then(m => m.ApplicantsModule)
  //     }
  //   ]
  // },

  // {
  //   path: '',
  //   children: [
  //     {
  //       path: 'company',
  //       loadChildren: () => import('./views/company-panel/company-panel.module').then(m => m.CompanyPanelModule)
  //     }
  //   ]
  // },

  // {
  //   path: '',
  //   children: [
  //     {
  //       path: 'applicant',
  //       loadChildren: () => import('./views/applicants-panel/applicants-panel.module').then(m => m.ApplicantsPanelModule)
  //     }
  //   ]
  // },

  // {
  //   path: '',
  //   component: HeaderComponent,
  //   children: [
  //     {
  //       path: 'error',
  //       loadChildren: () => import('./views/error-page/error-page.module').then(m => m.ErrorPageModule)
  //     }
  //   ]
  // },
  {
    path: '**',
    redirectTo: 'error/404'
  }
];

const routerOptions: any = {
  useHash: false,
  //anchorScrolling: 'false',
};

@NgModule({
  imports: [RouterModule.forRoot(rootRouterConfig, routerOptions)],
  exports: [RouterModule],
  /*providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],*/
})
export class AppRoutingModule { }
