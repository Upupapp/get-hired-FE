# GETHIRED_SEC_01_FRONTEND_PATCH_LOG_V1

**Mission:** BOLA/IDOR fix for GET /applicant/userprofile — Frontend Patch
**Date:** 2026-06-25

---

## Files Changed

1. `get-hired-FE/src/app/applicant/applicant.service.ts`
2. `get-hired-FE/src/app/applicant/state/applicant.actions.ts`
3. `get-hired-FE/src/app/applicant/state/applicant.effects.ts`
4. `get-hired-FE/src/app/applicant/state/applicant.facade.ts`
5. `get-hired-FE/src/app/applicant-panel/applicant-panel.component.ts`

---

## Change 1 — ApplicantService.userProfile()

**File:** `applicant/applicant.service.ts`

Before:
```ts
userProfile(userId: string) {
  return this.baseService.get<any>(`${this.applicantUrl}/userprofile?id=${userId}`);
}
```

After:
```ts
// SEC-01 FIX: removed uid query param (?id=userId). The backend now derives
// the requester identity exclusively from the verified Firebase JWT.
userProfile() {
  return this.baseService.get<any>(`${this.applicantUrl}/userprofile`);
}
```

**Effect:** The `?id=<userId>` query string is gone. The `Authorization: Bearer <token>` header (attached by the existing HTTP interceptor) is the only identity signal sent to the server.

---

## Change 2 — ApplicantActions.getUserProfile

**File:** `applicant/state/applicant.actions.ts`

Before:
```ts
export const getUserProfile = createAction(
  AllFeatureActionTypes.GetUserProfile,
  props<{ userId: string }>()
);
```

After:
```ts
// SEC-01 FIX: no userId prop — identity is resolved server-side from the JWT.
export const getUserProfile = createAction(
  AllFeatureActionTypes.GetUserProfile
);
```

**Effect:** No uid is carried in the NgRx action. No uid can accidentally be forwarded to the API.

---

## Change 3 — ApplicantEffects.user$

**File:** `applicant/state/applicant.effects.ts`

Before:
```ts
mergeMap((action) => this.applicantService.userProfile(action.userId)
  .pipe(
    catchError((err) => {
      const { error } = err.error;
      return of(ApplicantActions.getUserProfileFail({ payload: error }))
    })
  )
)
```

After:
```ts
mergeMap(() => this.applicantService.userProfile()
  .pipe(
    catchError((err) => {
      const httpStatus = err?.status;
      let safeMessage: string;
      if (httpStatus === 401) {
        safeMessage = 'Your session has expired. Please sign in again.';
      } else if (httpStatus === 403) {
        safeMessage = "We couldn't load this profile for your current session.";
      } else if (httpStatus === 404) {
        safeMessage = "Let's finish setting up your profile.";
      } else {
        safeMessage = "We couldn't load your profile. Please try again.";
      }
      return of(ApplicantActions.getUserProfileFail({ payload: safeMessage }))
    })
  )
)
```

**Effect:**
- `action.userId` no longer referenced (action has no payload)
- Error handling uses HTTP status code — safe, user-friendly copy
- No raw Firebase error, no raw BE error object, no uid exposed to UI
- 401 → "Your session has expired. Please sign in again."
- 403 → "We couldn't load this profile for your current session."
- 404 → "Let's finish setting up your profile."
- Generic → "We couldn't load your profile. Please try again."

---

## Change 4 — ApplicantFacade.getUser()

**File:** `applicant/state/applicant.facade.ts`

Before:
```ts
getUser(userId: string) {
  this.store.dispatch(ApplicantAction.getUserProfile({ userId }));
}
```

After:
```ts
// SEC-01 FIX: no userId arg. Identity is resolved server-side from JWT.
getUser() {
  this.store.dispatch(ApplicantAction.getUserProfile());
}
```

---

## Change 5 — ApplicantPanelComponent.ngOnInit()

**File:** `applicant-panel/applicant-panel.component.ts`

Before:
```ts
this.applicantFacade.getUser(this.local._id);
```

After:
```ts
// SEC-01 FIX: no longer passes local._id. Backend derives identity from JWT.
this.applicantFacade.getUser();
```

**Effect:** `localStorage`-derived uid is no longer sent to the server as an identity claim.

---

## Build Verification

`npm run build-dev` completed with **0 TypeScript errors, 0 Angular compilation errors**.

Output: Build at 2026-06-25T14:30:34.495Z — all chunks generated.
Warnings present: 2 pre-existing autoprefixer warnings in unrelated contact-group SCSS (not introduced by this fix).

---

## What Was NOT Changed

- `getApplicant(applicantId)` in `applicant.service.ts` — different endpoint (`/applicant/profile?id=`), already fixed in prior BOLA pass (uses `req.user.uid` server-side)
- All save/update service methods — unchanged
- Admin service `userProfile(userId)` — admin-only endpoint, intentional design, documented in backlog
- Auth service `getUserProfile()` — separate auth flow, unchanged
- NgRx reducer `getUserProfileSuccess` / `getUserProfileFail` handlers — unchanged (still store `action.user` and `action.payload`)
- All SSR / `isPlatformBrowser` guards — unchanged
- No new Angular modules imported
