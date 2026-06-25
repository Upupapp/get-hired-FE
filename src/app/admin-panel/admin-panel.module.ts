import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { AdminPanelComponent } from './admin-panel.component';
import { RouterModule, Routes } from '@angular/router';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { CoreModule } from '@app-core/core.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AuthFacade } from '@main/auth/state/auth.facade';
import { AdminFacade } from './state/admin.facade';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AdminEffects } from './state/admin.effects';
import { adminReducer } from './state/admin.reducer';
import { AdminUsersComponent } from './admin-users/admin-users.component';

const routes: Routes = [
  {
    path: '',
    component: AdminPanelComponent,
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [
    AdminPanelComponent,
    AdminSidebarComponent,
    AdminDashboardComponent,
    AdminUsersComponent
  ],
  imports: [
    CommonModule,
    A11yModule,
    CoreModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('admin', adminReducer),
    EffectsModule.forFeature([AdminEffects]),
  ],
  providers: [AuthFacade, AdminFacade ],
})
export class AdminPanelModule { }
