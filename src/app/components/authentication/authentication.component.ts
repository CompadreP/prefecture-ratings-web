import {Component, OnDestroy, ViewChild} from '@angular/core';

import {AuthenticationService} from "./authentication.service";
import {RequestsService} from "../../common/services/requests.service";
import {ROOT_API_URL} from "../../../settings";
import {
  NotificationTypeEnum,
  SimpleTextNotification
} from "../notification/notification.models";
import {NotificationService} from "../notification/notification.service";
import {validateEmail} from "../../common/functions";


@Component({
  selector: 'authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.sass'],
})
export class AuthenticationComponent implements OnDestroy{

  @ViewChild('loginModal')
  loginModal;

  email: string = '';
  password: string = '';
  loginError = null;
  successMessage = null;

  constructor(private authS: AuthenticationService,
              private reqS: RequestsService,
              private notiS: NotificationService) {
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

  ngOnDestroy() {
    this.email = '';
    this.password = '';
    this.loginError = null;
    this.successMessage = null;
  }

  public onSubmit = (): void => {
    this.authS.login(this.email, this.password);
  };

  public forgotPassword = ($event): void => {
    $event.preventDefault();
    $event.stopPropagation();
    if (validateEmail(this.email)) {
      this.loginError = null;
      this.reqS.http.post(
        `${ROOT_API_URL}/api/auth/reset_password/`,
        {
          email: this.email
        },
        this.reqS.options
      )
        .map(this.reqS.extractData)
        .catch(this.reqS.handleError)
        .subscribe(
          _ => {
            this.loginError = null;
            this.successMessage = 'На ваш email выслано письмо с дальнейшими инструкциями по смене пароля'
          },
          error => {
            this.loginError = error;
            this.successMessage = null;
            console.log(error);
          })
    } else {
      this.loginError = {};
      this.loginError['message'] = 'Введен некорректный email'
    }
  };


}
