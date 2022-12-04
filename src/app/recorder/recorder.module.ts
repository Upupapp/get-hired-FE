import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecorderComponent } from './recorder.component';
import { SharedModule } from '@app-shared/shared.module';
import { FormsModule } from '@angular/forms';
import { RecorderSettingComponent } from './recorder-setting/recorder-setting.component';



@NgModule({
  declarations: [
    RecorderComponent,
    RecorderSettingComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule
  ],
  exports:[
    RecorderComponent,
    RecorderSettingComponent
  ]
})
export class RecorderModule { }
