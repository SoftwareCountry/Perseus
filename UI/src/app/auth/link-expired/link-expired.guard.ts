import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { loginRouter } from '../../app.constants';
import { LinkType } from './link-expired.component';

@Injectable({
  providedIn: 'root'
})
export class LinkExpiredGuard implements CanActivate {
  constructor(private router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const linkTypes = Object.values(LinkType)
    const linkType = state.root.queryParams['linkType']
    const email = state.root.queryParams['email']
    if (email && linkTypes?.includes(linkType)) {
      return true
    }

    this.router.navigate([loginRouter])
    return false
  }
}
