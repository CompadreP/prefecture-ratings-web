/**
 * Created by evgeniy on 2017-03-05.
 */

import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map'
import {RequestsHandler} from "../abstract/classes/requests_handler";
import {Subject} from "rxjs";
import {RatingsUser} from "../models/auth";

@Injectable()
export class AuthenticationService extends RequestsHandler {
  private loginUrl: string = 'http://127.0.0.1:8000/api/auth/login';
  private logoutUrl: string = 'http://127.0.0.1:8000/api/auth/logout';
  private userLoggedInSource = new Subject<string>();
  private userLoggedOutSource = new Subject<string>();
  loginErrors: string;
  logoutErrors: string;

  userLoggedIn$ = this.userLoggedInSource.asObservable();
  userLoggedOut$ = this.userLoggedOutSource.asObservable();

  constructor(public http: Http) {
    super(http)
  }

  login(email: string, password: string) {
    return this.http.post(
      this.loginUrl,
      {
        email: email,
        password: password
      }, this.options)
      .map(this.extractData)
      .catch(this.handleError)
      .subscribe(
        user => {
          let ratings_user = new RatingsUser(user);
          console.log(ratings_user);
          localStorage.setItem('currentUser', user);
          this.userLoggedInSource.next(user);
        },
        error => {
          console.log(error);
          this.loginErrors = error
        }
      )
  }

  logout() {
    return this.http.post(
      this.logoutUrl,
      {})
      .map(this.extractData)
      .catch(this.handleError)
      .subscribe(
        data => {
          localStorage.removeItem('currentUser');
          this.userLoggedOutSource.next();
          location.reload();
        },
        error => {
          console.log(error)
        }
      )
  }

}
