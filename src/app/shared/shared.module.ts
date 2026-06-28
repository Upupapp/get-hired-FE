import { NgModule } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
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
import { ApplicationCompletenessBadgeComponent } from './components/application-completeness-badge/application-completeness-badge.component';
import { ApplicationCompletenessCardComponent } from './components/application-completeness-card/application-completeness-card.component';
import { ViewedOnceDirective } from './directives/viewed-once.directive';
import { PortalRevealDirective } from './directives/portal-reveal.directive';
import { GhImageUploadComponent } from './components/gh-image-upload/gh-image-upload.component';
import { GhResponsiveImageComponent } from './components/gh-responsive-image/gh-responsive-image.component';
import { SearchAutocompleteComponent } from './components/gh-search/search-autocomplete/search-autocomplete.component';
import { SearchJobCardComponent } from './components/gh-search/search-job-card/search-job-card.component';
import { SearchSkeletonComponent } from './components/gh-search/search-skeleton/search-skeleton.component';
import { SearchEmptyStateComponent } from './components/gh-search/search-empty-state/search-empty-state.component';
import { SearchCompanyCardComponent } from './components/gh-search/search-company-card/search-company-card.component';
import { SearchSpotlightCardComponent } from './components/gh-search/search-spotlight-card/search-spotlight-card.component';


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
  MessageThreadComponent,
  ApplicationCompletenessBadgeComponent,
  ApplicationCompletenessCardComponent,
  GhImageUploadComponent,
  GhResponsiveImageComponent,
  SearchAutocompleteComponent,
  SearchJobCardComponent,
  SearchSkeletonComponent,
  SearchEmptyStateComponent,
  SearchCompanyCardComponent,
  SearchSpotlightCardComponent,
];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialComponentsModule,
    NgxDocViewerModule,
    TranslateModule,
    RouterModule,
    A11yModule
  ],
  entryComponents: [...classesToInclude],
  providers: [
  { provide: MAT_DIALOG_DATA, useValue: {} },
  { provide: MatDialogRef, useValue: {} }],
  declarations: [...classesToInclude, ViewedOnceDirective, PortalRevealDirective],
  exports: [
    ...classesToInclude,
    ViewedOnceDirective,
    PortalRevealDirective,
    MaterialComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule,
    A11yModule
  ]
})
export class SharedModule { }
