import {Response, Headers, RequestOptions, Http} from "@angular/http";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";

/**
 * Created by evgeniy on 2017-03-05.
 */
@Injectable()
export class RequestsHandler {

  constructor(public http: Http) {
  }

  getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length == 2) {
      return parts.pop().split(";").shift()
    }
  }

  public headers = new Headers(
    {
      'Content-Type': 'application/json',
      'X-CSRFToken': this.getCookie('csrftoken')
    }
  );
  public options = new RequestOptions(
    {
      headers: this.headers,
      withCredentials: true,
    }
  );

  extractData(res: Response) {
    console.log(res)
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
