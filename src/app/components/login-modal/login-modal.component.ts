import {Component, ViewChild} from '@angular/core';
import 'rxjs/add/operator/map';

import {ModalDirective} from 'ng2-bootstrap/modal';

import {AuthenticationService} from "../../services/authentication.service";

@Component({
  selector: 'login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.sass'],
  providers: [AuthenticationService]
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

  public onSubmit(): void {
    let result = this.authenticationService.login(this.email, this.password);
    console.log(result)
  }

}
