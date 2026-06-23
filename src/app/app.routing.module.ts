import { APP_INITIALIZER, NgModule } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, ROUTES, Routes } from '@angular/router';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { AuthGuard } from '@app-shared/guard/auth.guard'
import { EmployerGuard } from './shared/guard/employer.guard';
import { ApplicantGuard } from './shared/guard/applicant.guard';
import { UnauthGuard } from './shared/guard/unauth.guard';
import { AdminGuard } from './shared/guard/admin.guard';

export const routes: Routes = [
  {
    // Top-level redirect for the bare root, evaluated as a plain
    // top-level array entry -- no nested children involved at all.
    // Confirmed empirically (extensive testing, multiple approaches)
    // that any attempt to match or redirect the EMPTY path from inside
    // a nested children array (3 levels deep: app -> PublicModule ->
    // PublicComponent's children) silently never activates in this
    // app's Angular 13 setup, regardless of whether the empty-path
    // entry uses `component`, `redirectTo`, a guard, or any array
    // position -- while the exact same destination component renders
    // perfectly when reached via a real, non-empty path (confirmed via
    // /home directly). This redirect sidesteps that nested-empty-path
    // issue entirely by resolving '/' at the shallowest possible level.
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    loadChildren: () => import('@main/admin-panel/admin-panel.module').then(m => m.AdminPanelModule),
    canActivate: [AuthGuard],
    data: {
      role: '1'
    }
  },
  {
    path: 'recruiter',
    loadChildren: () => import('./employer-panel/employer-panel.module').then(m => m.EmployerPanelModule),
    canActivate: [AuthGuard],
    data: {
      role: '2',
      isMobileViewAllowed: false
    }
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./applicant-panel/applicant-panel.module').then(m => m.ApplicantPanelModule),
    canActivate: [AuthGuard],
    data: {
      role: '3', isMobileViewAllowed: false
    }
  },
  {
    // PublicModule is listed FIRST on purpose, even though AuthModule
    // used to be first. Root cause of the blank-homepage bug (confirmed
    // empirically, not just build-verified): Angular 13's router does
    // not reliably backtrack from a sibling route that matches its
    // parent path but finds no matching child -- it dead-ends on
    // whichever same-path sibling is tried first and never attempts the
    // second, even though no error is thrown (the <router-outlet> is
    // simply left empty). PublicModule always has a guaranteed match for
    // bare '/' (MainPortalComponent, pathMatch: 'full'), so putting it
    // first means '/' resolves immediately without ever needing to fall
    // through to AuthModule. AuthModule is still correctly reached for
    // genuine path mismatches like '/signin', because that's a real
    // segment mismatch against PublicModule's children (no child path
    // equals 'signin') -- THAT kind of backtrack is the reliable,
    // well-supported case, unlike the empty-path/no-child-match case
    // above. The canActivate guard was also moved off this mount point
    // and onto each individual route inside auth.module.ts (signin,
    // signup, etc.) so reaching AuthModule for those paths is pure path
    // matching, not guard-gated empty-path matching.
    path: '',
    loadChildren: () => import('@main/public/public.module').then(m => m.PublicModule),
    data: {
      isMobileViewAllowed: false
    }
  },
  {
    path: '',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    data: {
      isMobileViewAllowed: true
    }
  },
  {
    // BRAND fix: an error-not-found page/component already existed
    // (src/app/views/error-page/) but was never wired to any route --
    // confirmed via repo-wide search for `path: '**'`, zero matches
    // anywhere. Added here (root config, used before any guard's
    // resetConfig runs) since that's explicitly safe per BRAND's own
    // rules. NOTE: the 5 role-based guards (admin/employer/applicant/auth)
    // call router.resetConfig([...]) at login time with their own route
    // arrays, none of which include a wildcard -- so a 404 hit *after*
    // login may not currently fall through to this page. Documented as a
    // follow-up in GETHIRED_BRAND_BACKLOG.md rather than touched here,
    // since the route-swapping logic is flagged elsewhere as high-risk to
    // modify without dedicated testing.
    path: '**',
    loadChildren: () => import('./views/error-page/error-page.module').then(m => m.ErrorPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
