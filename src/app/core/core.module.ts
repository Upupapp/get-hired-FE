import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { AuthModule } from '@main/auth/auth.module';



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
  ]
})
export class CoreModule { }
