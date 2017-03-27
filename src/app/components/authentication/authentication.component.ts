import {Component, ViewChild} from '@angular/core';

import {AuthenticationService} from "./authentication.service";


@Component({
  selector: 'authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.sass'],
})
export class AuthenticationComponent {

  @ViewChild('loginModal')
  loginModal;

  email: string = '';
  password: string = '';
  loginError = null;

  constructor(private authS: AuthenticationService) {
    authS.loginRequest$.subscribe(
      _ => {
        this.loginModal.show();
      });
    authS.successfulLogin$.subscribe(
      _ => {
        this.loginModal.hide();
      }
    );
    authS.failedLogin$.subscribe(
      error => {
        this.loginError = error;
      }
    )
  }

  public onSubmit = (): void => {
    this.authS.login(this.email, this.password);
  }


}
