/**
 * Created by evgeniy on 2017-03-05.
 */

import {Response, Headers, RequestOptions, Http} from "@angular/http";
import {Observable} from "rxjs";
import {Injectable, EventEmitter} from "@angular/core";
import {RatingsError} from "../common/classes/error";

@Injectable()
export class RequestsService {
  public serverUnavailable$;

  constructor(public http: Http) {
    this.serverUnavailable$ = new EventEmitter();
  }

  get headers(): Headers {
    return new Headers({
      'Content-Type': 'application/json',
      'X-CSRFToken': this.getCookie('csrftoken')
    });
  }

  get options(): RequestOptions {
    return new RequestOptions({
      headers: this.headers,
      withCredentials: true,
    });
  }

  getCookie = (name) => {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length == 2) {
      return parts.pop().split(";").shift()
    }
  };

  extractData = (res: Response) => {
    // console.log(res);
    let data;
    if (res.text() === '') {
      data = {}
    } else {
      data = res.json();
    }
    return data || {};
  };

  handleError = (error: Response | any) => {
    let errMsg = new RatingsError();
    if (error instanceof Response) {
        errMsg.status = error.status;
        errMsg.statusText=error.statusText;
      if (error.text()) {
        errMsg.text = error.text()
      }
    } else {
       errMsg.message = error.message ? error.message : error.toString();
    }
    if ([0, 500, 502].indexOf(errMsg.status) > -1) {
      this.serverUnavailable$.emit();
    }
    return Observable.throw(errMsg);
  }

}
