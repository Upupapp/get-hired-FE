import { Routes } from '@angular/router';
import { ErrorNotFoundComponent } from '../../auth/error-not-found/error-not-found.component';

export const ErrorPageRoutes: Routes = [
  { path: '404', component: ErrorNotFoundComponent },
];
