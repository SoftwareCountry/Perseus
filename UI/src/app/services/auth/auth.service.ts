import { User } from '@models/auth/user';
import { Observable } from 'rxjs';

export interface AuthService {

  user: User

  isUserLoggedIn: boolean

  isUserLoggedIn$: Observable<boolean>

  login(email?: string, password?: string): Observable<boolean | User>

  logout(): Observable<void>

  register(user: User): Observable<void>

  recoverPassword(email: string): Observable<void>

  reset(password: string, token: string): Observable<void>

  refreshToken(email?: string, token?: string): Observable<boolean | User>
}

export const localStorageUserField = 'currentUser'
