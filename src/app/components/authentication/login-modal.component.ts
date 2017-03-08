import {Component, ViewChild} from '@angular/core';

import {ModalDirective} from 'ng2-bootstrap/modal';

import {AuthenticationService} from "../../services/authentication.service";


@Component({
  selector: 'login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.sass'],
})
export class LoginModalComponent {

  constructor(private authenticationService: AuthenticationService) {
  }

  @ViewChild('loginModal') private loginModal: ModalDirective;
  public email: string = '';
  public password: string = '';

  public showLoginModal(): void {
    this.loginModal.show()
  }

  public hideLoginModal(): void {
    this.loginModal.hide()
  }

  public onSubmit(): void {
    this.authenticationService.login(this.email, this.password);
    this.hideLoginModal();
  }

}
