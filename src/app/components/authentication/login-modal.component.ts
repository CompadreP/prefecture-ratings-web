import {Component, ViewChild} from '@angular/core';

import {AuthenticationService} from "../../services/authentication.service";
import {RequestsService} from "../../services/requests.service";


@Component({
  selector: 'login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.sass'],
})
export class LoginModalComponent {

  @ViewChild('loginModal')
  loginModal;

  email: string = '';
  password: string = '';
  loginError = null;

  constructor(private authenticationService: AuthenticationService) {
    authenticationService.loginRequest$.subscribe(
      _ => {
        this.loginModal.show();
      });
    authenticationService.successfulLogin$.subscribe(
      _ => {
        this.loginModal.hide();
      }
    );
    authenticationService.failedLogin$.subscribe(
      error => {
        this.loginError = error;
      }
    )
  }

  onSubmit = (): void => {
    this.authenticationService.login(this.email, this.password);
  }


}
