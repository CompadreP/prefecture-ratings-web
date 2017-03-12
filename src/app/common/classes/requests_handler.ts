/**
 * Created by evgeniy on 2017-03-05.
 */

import {Response, Headers, RequestOptions, Http} from "@angular/http";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable()
export class RequestsHandler {
  constructor(public http: Http) {
  }

  private _headers = () => {
    return new Headers({
      'Content-Type': 'application/json',
      'X-CSRFToken': this.getCookie('csrftoken')
    });
  };

  private _options = () => {
    return new RequestOptions({
        headers: this.headers,
        withCredentials: true,
      });
  };

  get headers(): Headers {
    return this._headers();
  }

  get options(): RequestOptions {
    return this._options();
  }

  getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length == 2) {
      return parts.pop().split(";").shift()
    }
  }

  extractData(res: Response) {
    console.log(res);
    let data;
    if (res.text() === '') {
      data = {}
    } else {
      data = res.json();
    }
    return data || {};
  }

  handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      errMsg = `${error.status} - ${error.statusText || ''}`;
      if (error.text()) {
        errMsg += '\n' + error.text()
      }
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    return Observable.throw(errMsg);
  }

}
