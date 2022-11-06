import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { EmployeeEffects } from './state/employee.effects';
import { employeeReducer } from './state/employee.reducer';
import { EmployeeFacade } from './state/employee.facade';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature('employee', employeeReducer),
    EffectsModule.forFeature([EmployeeEffects])
  ],
  providers: [EmployeeFacade]
})
export class EmployeeModule { }
