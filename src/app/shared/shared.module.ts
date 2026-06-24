import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Routes, RouterModule } from '@angular/router';
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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxDocViewerModule } from 'ngx-doc-viewer';

// import { NgxOrgChartModule } from 'ngx-org-chart';

import { EmptySectionComponent } from './components/empty-section/empty-section.component';
import { UnderConstructionComponent } from './components/under-construction/under-construction.component';
import { SuccessDialogComponent } from './components/success-dialog/success-dialog.component';
import { FileViewerComponent } from './components/file-viewer/file-viewer.component';
import { VideoPreviewComponent } from './components/video-preview/video-preview.component';
import { RecordLoadingComponent } from './components/record-loading/record-loading.component';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { LanguageSelectionComponent } from './components/language-selection/language-selection.component';
import { DropdownSearchComponent } from './components/input/dropdown-search/dropdown-search.component';
import { GoogleAddressSearchComponent } from './components/google-address-search/google-address-search.component';
import { CountdownTimerComponent } from './components/countdown-timer/countdown-timer.component';
import { SubscriptionAlertComponent } from './components/subscription-alert/subscription-alert.component';
import { InlineLoadingComponent } from './components/inline-loading/inline-loading.component';
import { LockedMatchTeaserComponent } from './components/locked-match-teaser/locked-match-teaser.component';
import { TalentProofBadgeComponent } from './components/talent-proof-badge/talent-proof-badge.component';
import { MessageThreadComponent } from './components/message-thread/message-thread.component';
import { ViewedOnceDirective } from './directives/viewed-once.directive';


const classesToInclude: any[] = [
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
  AddAccessModalComponent,
  TabSelectorsComponent,
  EmptySectionComponent,
  UnderConstructionComponent,
  SuccessDialogComponent,
  FileViewerComponent,
  VideoPreviewComponent,
  RecordLoadingComponent,
  ConfirmationDialogComponent,
  LanguageSelectionComponent,
  DropdownSearchComponent,
  EmptySectionComponent,
  DropdownSearchComponent,
  GoogleAddressSearchComponent,
  CountdownTimerComponent,
  SubscriptionAlertComponent,
  InlineLoadingComponent,
  LockedMatchTeaserComponent,
  TalentProofBadgeComponent,
  MessageThreadComponent
];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialComponentsModule,
    NgxDocViewerModule,
    TranslateModule
  ],
  entryComponents: [...classesToInclude],
  providers: [
  { provide: MAT_DIALOG_DATA, useValue: {} },
  { provide: MatDialogRef, useValue: {} }],
  declarations: [...classesToInclude, ViewedOnceDirective],
  exports: [
    ...classesToInclude,
    ViewedOnceDirective,
    MaterialComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ]
})
export class SharedModule { }
