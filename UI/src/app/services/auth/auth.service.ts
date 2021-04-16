import { User } from '../../models/user';
import { Observable } from 'rxjs/internal/Observable';
import { LinkType } from '../../auth/link-expired/link-expired.component';

export interface AuthService {

  user: User

  isUserLoggedIn: boolean

  login(email: string, password: string): Observable<User>

  logout(): Observable<void>

  register(user: User): Observable<void>;

  recoverPassword(email: string): Observable<void>;

  reset(password: string, token: string): Observable<void>;

  resetLink(email: string, linkType: LinkType): Observable<void>;
}

export const localStorageUserField = 'currentUser'
