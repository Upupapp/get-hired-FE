import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '@app-company/company.service';
import { SnackbarService } from '@app-core/services/snackbar.service';

type ViewState = 'loading' | 'invalid' | 'form' | 'submitting' | 'accepted' | 'sign-in-required';

@Component({
  selector: 'app-accept-invite',
  templateUrl: './accept-invite.component.html',
  styleUrls: ['./accept-invite.component.scss']
})
export class AcceptInviteComponent implements OnInit {
  state: ViewState = 'loading';
  token: string | null = null;

  companyName = '';
  companyLogoUrl = '';
  roleName = '';

  nameForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private formBuilder: FormBuilder,
    private snackbarService: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.nameForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
    });

    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.state = 'invalid';
      return;
    }

    this.companyService.previewInvite(this.token).subscribe({
      next: (res: any) => {
        const preview = res && res.data;
        if (!preview) {
          this.state = 'invalid';
          return;
        }
        this.companyName = preview.companyName;
        this.companyLogoUrl = preview.companyLogoUrl;
        this.roleName = preview.roleName;
        this.state = 'form';
      },
      error: () => {
        this.state = 'invalid';
      }
    });
  }

  accept(): void {
    if (!this.token || this.nameForm.invalid) { return; }
    this.state = 'submitting';

    const payload = {
      firstName: this.nameForm.value.firstName,
      lastName: this.nameForm.value.lastName,
    };

    this.companyService.acceptInvite(this.token, payload).subscribe({
      next: () => {
        this.state = 'accepted';
        this.snackbarService.success(`You've joined ${this.companyName}. Sign in to get started.`);
        setTimeout(() => this.router.navigate(['/signin']), 2000);
      },
      error: (err: any) => {
        if (err && err.status === 401) {
          this.state = 'sign-in-required';
          return;
        }
        this.state = 'form';
        this.snackbarService.error('Unable to accept this invite. Please try again.');
      }
    });
  }

  goToSignIn(): void {
    this.router.navigate(['/signin'], { queryParams: { redirectAfter: this.router.url } });
  }
}
