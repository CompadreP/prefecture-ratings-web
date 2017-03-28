/**
 * Created by evgeniy on 2017-03-05.
 */

import {Injectable, EventEmitter} from '@angular/core';
import 'rxjs/add/operator/map';
import {RequestsService} from "../../common/services/requests.service";
import {RatingsUser} from "./authentication.models";
import {ROOT_API_URL} from "../../../settings";
import {NotificationService} from "../notification/notification.service";

@Injectable()
export class AuthenticationService {
  private loginUrl: string = `${ROOT_API_URL}/api/auth/login`;
  private logoutUrl: string = `${ROOT_API_URL}/api/auth/logout`;

  loginRequest$;
  successfulLogin$;
  failedLogin$;
  user: RatingsUser;

  constructor(private reqS: RequestsService,
              private notiS: NotificationService) {
    this.loginRequest$ = new EventEmitter();
    this.successfulLogin$ = new EventEmitter();
    this.failedLogin$ = new EventEmitter();
  }

  public login = (email: string, password: string): void => {
    this.reqS.http.post(
      this.loginUrl,
      {
        email: email,
        password: password
      }, this.reqS.options)
      .map(this.reqS.extractData)
      .catch(this.reqS.handleError)
      .subscribe(
        user => {
          this.user = new RatingsUser(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.successfulLogin$.emit();
          location.reload();
        },
        error => {
          this.failedLogin$.emit(error);
          console.log(error);
        }
      )
  };

  public logout = (): void => {
    this.reqS.http.post(
      this.logoutUrl,
      {},
      this.reqS.options)
      .map(this.reqS.extractData)
      .catch(this.reqS.handleError)
      .subscribe(
        _ => {
          localStorage.removeItem('currentUser');
          location.reload();
        },
        error => {
          this.notiS.notificateError(error);
          console.log(error)
        }
      )
  };

  public checkExistingAuth = (): void => {
    let user;
    let savedUser = localStorage.getItem('currentUser');
    if (savedUser !== null) {
      user = savedUser;
    } else {
      user = null;
    }
    this.user = user ? new RatingsUser(JSON.parse(user)) : null;
  }

}
