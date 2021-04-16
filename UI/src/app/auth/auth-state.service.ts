import { Injectable } from '@angular/core';

/*
* Store reset password token,
* Already registered email,
* Expired Link type.
 */
@Injectable()
export class AuthStateService {
  private authState: any

  get state(): any {
    return this.authState
  }

  set state(state: any) {
    this.authState = state
  }
}

