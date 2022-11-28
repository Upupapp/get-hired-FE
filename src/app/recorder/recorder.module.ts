import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecorderComponent } from './recorder.component';
import { SharedModule } from '@app-shared/shared.module';



@NgModule({
  declarations: [
    RecorderComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports:[
    RecorderComponent
  ]
})
export class RecorderModule { }
