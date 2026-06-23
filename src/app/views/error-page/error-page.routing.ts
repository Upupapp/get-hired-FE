import { Routes } from '@angular/router';
import { ErrorNotFoundComponent } from './error-not-found/error-not-found.component';

export const ErrorPageRoutes: Routes = [
  // BRAND fix: this module is now lazy-loaded via the root `**` wildcard
  // route (app.routing.module.ts), which needs an empty inner path to
  // actually render for any unmatched URL -- the old `404`-only path meant
  // this only ever matched a literal `/404`, which nothing ever linked to.
  { path: '', component: ErrorNotFoundComponent },
  { path: '404', component: ErrorNotFoundComponent },
];
