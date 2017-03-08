/**
 * Created by evgeniy on 2017-03-05.
 */

import {Injectable, OnInit} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {RequestsHandler} from "../common/classes/requests_handler";
import {BehaviorSubject} from "rxjs";
import {RatingsUser} from "../models/auth";
import {ROOT_API_URL} from "../../settings";

@Injectable()
export class AuthenticationService extends RequestsHandler {
  private loginUrl: string = ROOT_API_URL + '/api/auth/login';
  private logoutUrl: string = ROOT_API_URL + '/api/auth/logout';

  private _user$ = new BehaviorSubject(null);
  public user$ = this._user$.asObservable();

  constructor(public http: Http) {
    super(http);
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
          this._user$.next(new RatingsUser(user));
          localStorage.setItem('currentUser', JSON.stringify(user));
        },
        error => {
          console.log(error);
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
        _ => {
          localStorage.removeItem('currentUser');
          location.reload();
        },
        error => {
          console.log(error)
        }
      )
  }

  checkExistingAuth() {
    let user;
    let savedUser = localStorage.getItem('currentUser');
    if (savedUser !== null) {
      user = savedUser;
    } else {
      user = null;
    }
    this._user$.next(user ? new RatingsUser(JSON.parse(user)) : null);
  }

}
