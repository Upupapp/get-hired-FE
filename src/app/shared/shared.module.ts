import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Routes, RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header-bak/header.component.bak';
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
import { MainStepperComponent } from './components/main-stepper/main-stepper.component';
import { LoadingComponent } from './components/loading/loading.component';
import { TabSelectorsComponent } from './components/tab-selectors/tab-selectors.component';
import { AddAccessModalComponent } from './components/add-access-modal/add-access-modal.component';
import { MatDialogRef } from '@angular/material/dialog';
// import { NgxOrgChartModule } from 'ngx-org-chart';


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
  MainStepperComponent,
  LoadingComponent,
  TabSelectorsComponent,
  AddAccessModalComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    MaterialComponentsModule
  ],
  entryComponents: [...classesToInclude],
  providers: [{
    provide: MatDialogRef,
    useValue: {}
  }],
  declarations: classesToInclude,
  exports: [
    ...classesToInclude,
    MaterialComponentsModule
  ]
})
export class SharedModule { }
