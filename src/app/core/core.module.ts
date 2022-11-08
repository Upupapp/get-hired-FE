import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { AuthModule } from '@main/auth/auth.module';
import { CoreService } from './services/core.service';



@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    CommonModule,
    AuthModule
  ],
  exports: [
    HeaderComponent
  ],
  providers: [CoreService]
})
export class CoreModule { }
