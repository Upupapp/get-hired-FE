import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminState } from './admin.reducer';

const getAdminInitState =
  createFeatureSelector<AdminState>('admin');

export const loading = createSelector(
  getAdminInitState,
  (state) => state.loading
);

export const getUser = createSelector(
  getAdminInitState,
  (state) => state.user
);

export const getAdminById = createSelector(
  getAdminInitState,
  (state) => state.selected
);

export const adminDashboard = createSelector (
  getAdminInitState,
  state => state.dashboard
);

// export const adminLoading = createSelector(
//   getAdminInitState,
//   state => state.loading
// );

export const success = createSelector(
  getAdminInitState,
  state => state.succesMsg
);

// export const getAdminDetails = createSelector(
//   getAdminInitState,
//   state => state.selected
// );

