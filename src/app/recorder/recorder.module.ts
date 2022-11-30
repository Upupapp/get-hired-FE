import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecorderComponent } from './recorder.component';
import { SharedModule } from '@app-shared/shared.module';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    RecorderComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule
  ],
  exports:[
    RecorderComponent
  ]
})
export class RecorderModule { }
