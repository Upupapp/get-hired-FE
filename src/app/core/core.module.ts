import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { CoreService } from './services/core.service';
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
  providers: [CoreService]
})
export class CoreModule { }
