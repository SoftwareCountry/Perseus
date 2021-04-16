import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStateService } from '../auth-state.service';
import { AuthService } from '../../services/auth/auth.service';
import { authInjector } from '../../services/auth/auth-injector';

export enum LinkType {
  EMAIL = 'registration',
  PASSWORD = 'reset_password'
}

@Component({
  selector: 'app-link-expired',
  templateUrl: './link-expired.component.html',
  styleUrls: [
    './link-expired.component.scss',
    '../auth.component.scss'
  ]
})
export class LinkExpiredComponent implements OnInit, OnDestroy {

  get message(): string {
    return this.authStateService.state === LinkType.EMAIL ?
      'Verification link from e-mail is expired.' :
      'Password reset link is expired.';
  }

  constructor(private router: Router,
              private route: ActivatedRoute,
              private authStateService: AuthStateService,
              @Inject(authInjector) private authService: AuthService) {
  }

  get linkType() {
    return this.authStateService.state.linkType
  }

  get email() {
    return this.authStateService.state.email
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        filter(params => !!params['linkType'])
      )
      .subscribe(params => {
        this.authStateService.state = {
          linkType: params['linkType'],
          email: params['email']
        }
        this.router.navigate([])
      })
  }

  ngOnDestroy() {
    this.authStateService.state = null;
  }

  sendEmail() {
    this.authService.resetLink(this.email, this.linkType)
      .subscribe(() => {
        this.authStateService.state = true
        const url = this.linkType === LinkType.EMAIL ? 'sign-up' : 'recover-password'
        this.router.navigateByUrl(url)
      })
  }
}
