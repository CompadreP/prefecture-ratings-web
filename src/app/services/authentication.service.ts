/**
 * Created by evgeniy on 2017-03-05.
 */

import {Injectable, EventEmitter} from '@angular/core';
import 'rxjs/add/operator/map';
import {RequestsService} from "./requests.service";
import {RatingsUser} from "../models/auth";
import {ROOT_API_URL} from "../../settings";

@Injectable()
export class AuthenticationService {
  private loginUrl: string = `${ROOT_API_URL}/api/auth/login`;
  private logoutUrl: string = `${ROOT_API_URL}/api/auth/logout`;

  public loginRequest$;
  public successfulLogin$;
  public failedLogin$;

  public user: RatingsUser;

  constructor(private requestsService: RequestsService) {
    this.loginRequest$ = new EventEmitter();
    this.successfulLogin$ = new EventEmitter();
    this.failedLogin$ = new EventEmitter();
  }

  login = (email: string, password: string) => {
    return this.requestsService.http.post(
      this.loginUrl,
      {
        email: email,
        password: password
      }, this.requestsService.options)
      .map(this.requestsService.extractData)
      .catch(this.requestsService.handleError)
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

  logout = () => {
    return this.requestsService.http.post(
      this.logoutUrl,
      {})
      .map(this.requestsService.extractData)
      .catch(this.requestsService.handleError)
      .subscribe(
        _ => {
          localStorage.removeItem('currentUser');
          location.reload();
        },
        error => {
          console.log(error)
        }
      )
  };

  checkExistingAuth = () => {
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
