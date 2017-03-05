import {Component, ViewChild} from '@angular/core';
import {Headers, RequestOptions, Http, Response} from '@angular/http';
import 'rxjs/add/operator/map';

import {ModalDirective} from 'ng2-bootstrap/modal';
import {Observable} from "rxjs";

@Component({
  selector: 'login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.sass']
})
export class LoginModalComponent {

  constructor(private http: Http) {
  }

  @ViewChild('loginModal') private loginModal: ModalDirective;
  private loginUrl: string = 'http://localhost:8000/api/auth/login';

  private extractData(res: Response) {
    let body = res.json();
    return body.data || {};
  }

  private handleError(error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

  public showLoginModal(): void {
    this.loginModal.show()
  }

  public submitLogin(email: string, password: string): void {
    console.log(email, password);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    this.http.post(this.loginUrl, {
      'email': email,
      'password': password
    }, options)
      .map(this.extractData)
      .catch(this.handleError)
      .subscribe(
        data => console.log(data),
        error => console.log(error),
      )
  }

    //.catch(this.handleError);

}
