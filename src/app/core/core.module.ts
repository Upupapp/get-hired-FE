import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { CoreService } from './services/core.service';
import { SnackbarService } from './services/snackbar.service';
import { HapticService } from './services/haptic.service';
import { SharedModule } from '@app-shared/shared.module';



@NgModule({
  declarations: [
    HeaderComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    HeaderComponent
  ],
  // SnackbarService and HapticService are providedIn: 'root' — do not list
  // them here or Angular creates a second injector-scoped instance that
  // shadow-registers over the root singleton, breaking any component that
  // injects the root instance (they get the CoreModule-scoped copy instead).
  providers: [CoreService]
})
export class CoreModule { }
