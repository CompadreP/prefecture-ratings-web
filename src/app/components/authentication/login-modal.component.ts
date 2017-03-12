import {Component, ViewChild} from '@angular/core';

import {AuthenticationService} from "../../services/authentication.service";


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

  constructor(private authenticationService: AuthenticationService) {
    authenticationService.loginRequest$.subscribe(
      _ => {
        this.loginModal.show();
      })
  }

  onLoginRequest() {
    this.loginModal.show();
  }

  onSubmit(): void {
    this.authenticationService.login(this.email, this.password);
    this.loginModal.hide();
  }


}
