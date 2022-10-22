import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Routes, RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { CustomProfileLoaderComponent } from './components/custom-profile-loader/custom-profile-loader.component';
import { HttpClientModule } from '@angular/common/http';
import { MaterialComponentsModule } from './components/material-components/material-components.module';
import { FooterComponent } from './components/footer/footer.component'
import { DatepickerComponent } from './components/input/date-picker/date-picker.component';
import { ReusableTableComponent } from './components/reusable-table/reusable-table.component';
import { ReusableOrgChartComponent } from './components/reusable-org-chart/reusable-org-chart.component';
import { FileUploadComponent } from './components/input/file-upload/file-upload.component';
import { FileUploadDocumentComponent } from './components/input/file-upload-document/file-upload-document.component';
import { DragAndDropComponent } from './components/input/drag-and-drop/drag-and-drop.component';
import { NgxOrgChartModule } from 'ngx-org-chart';
import { MainStepperComponent } from './components/main-stepper/main-stepper.component';

const classesToInclude: any[] = [
  HeaderComponent,
  CustomProfileLoaderComponent,
  FooterComponent,
  DatepickerComponent,
  ReusableTableComponent,
  FileUploadComponent,
  FileUploadDocumentComponent,
  ReusableOrgChartComponent,
  DragAndDropComponent,
  MainStepperComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxOrgChartModule,
    MaterialComponentsModule
  ],
  entryComponents: [...classesToInclude],
  providers: [],
  declarations: classesToInclude,
  exports: [
    ...classesToInclude,
    MaterialComponentsModule
  ]
})
export class SharedModule { }
