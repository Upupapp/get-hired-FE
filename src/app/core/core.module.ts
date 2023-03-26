import { ErrorHandler, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { CoreService } from './services/core.service';
import { GlobalErrorHandler } from './global-error-handler';


@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    HeaderComponent
  ],
  providers: [CoreService, {
    // processes all errors
    provide: ErrorHandler,
    useClass: GlobalErrorHandler,
  }]
})
export class CoreModule { }
