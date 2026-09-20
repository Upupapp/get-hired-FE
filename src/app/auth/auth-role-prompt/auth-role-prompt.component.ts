import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AuthRole } from '@app-shared/utils/auth-role-query';

@Component({
  selector: 'app-auth-role-prompt',
  templateUrl: './auth-role-prompt.component.html',
  styleUrls: ['./auth-role-prompt.component.scss']
})
export class AuthRolePromptComponent implements AfterViewInit {
  @Input() flow: 'signin' | 'signup' = 'signin';
  @Output() roleSelected = new EventEmitter<AuthRole>();
  @ViewChild('employerChoice') employerChoice?: ElementRef<HTMLButtonElement>;
  visible = true;

  get actionLabel(): string {
    return this.flow === 'signup' ? 'Create your account' : 'Continue to sign in';
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.employerChoice?.nativeElement.focus());
  }

  choose(role: AuthRole): void {
    this.visible = false;
    this.roleSelected.emit(role);
  }
}
