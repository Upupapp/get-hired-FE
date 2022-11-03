import { NgModule } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, ROUTES, Routes } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { AuthGuard } from '@app-shared/guard/auth.guard'
import { EmployerGuard } from './shared/guard/employer.guard';
import { ApplicantGuard } from './shared/guard/applicant.guard';
import { CoreService } from './core/services/core.service';
import { UnauthGuard } from './shared/guard/unauth.guard';
import { AdminGuard } from './shared/guard/admin.guard';

// const role = localStorage.getItem('role');

// const rootRouterConfig: Routes = [
//   {
//     path: 'admin',
//     loadChildren: () => import('./admin-panel/admin-panel.module').then(m => m.AdminPanelModule),
//     canActivate: [AuthGuard],
//     data: {
//       withNav: false
//     }
//   },
// {
//   path: '',
//   canActivate: [AuthGuard],
//   loadChildren: () => {
//     if (role && role == '2') {
//       return import('./employer-panel/employer-panel.module').then(m => m.EmployerPanelModule);
//     } else if (role && role == '3') {
//       return import('./applicant-panel/applicant-panel.module').then(m => m.ApplicantPanelModule);
//     } else {

//     }
//     console.log('Hala');
//   },
//   data: {
//     withNav: false
//   }
// },


// {
//   path: '',
//   loadChildren: () => import('./employer-panel/employer-panel.module').then(m => m.EmployerPanelModule),
//   canActivate: [AuthGuard, EmployerGuard],
//   data: {
//     withNav: false
//   }
// },
// {
//   path: '',
//   loadChildren: () => import('./applicant-panel/applicant-panel.module').then(m => m.ApplicantPanelModule),
//   canActivate: [AuthGuard, ApplicantGuard],
//   data: {
//     withNav: false
//   }
// },
// {
//   path: '',
//   loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
//   data: {
//     withNav: false
//   }
// },
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
//   {
//     path: '**',
//     redirectTo: 'error/404'
//   }
// ];

const routerOptions: any = {
  useHash: false,
  //anchorScrolling: 'false',
};

function routesFactory(coreService: CoreService) {
  const role = coreService.getRole();
  console.log(role);
  return [
    {
      path: 'admin',
      loadChildren: () => import('./admin-panel/admin-panel.module').then(m => m.AdminPanelModule),
      canActivate: [AuthGuard, AdminGuard],
      data: {name: "admin"}
    },
    {
      path: '',
      loadChildren: () => import('./employer-panel/employer-panel.module').then(m => m.EmployerPanelModule),
      canActivate: [AuthGuard, EmployerGuard],
      data: {name: "employer"}
    },
    {
      path: '',
      loadChildren: async () =>
        import('./applicant-panel/applicant-panel.module').then(m => m.ApplicantPanelModule),
      canActivate: [AuthGuard, ApplicantGuard],
      data: {name: "applicant"}
    },
    {
      path: '',
      loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
      canActivate: [UnauthGuard],
      data: {name: "auth"}
    }
  ]
}

@NgModule({
  imports: [RouterModule.forRoot([])],
  providers: [{
    provide: ROUTES,
    useFactory: routesFactory,
    multi: true,
    deps: [CoreService]
  }],
  exports: [RouterModule],
  /*providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],*/
})
export class AppRoutingModule { }
