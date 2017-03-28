import {Component} from '@angular/core';
import {AuthenticationService} from "../authentication/authentication.service";
import {RequestsService} from "../../common/services/requests.service";
import {ROOT_API_URL} from "../../../settings";
import {NotificationService} from "../notification/notification.service";
import {
  NotificationTypeEnum,
  SimpleTextNotification
} from "../notification/notification.models";


@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass'],
})
export class NavbarComponent {
  isCollapsed: boolean = true;

  constructor(public authS: AuthenticationService,
              private reqS: RequestsService,
              private notiS: NotificationService) {

  }

  showLoginModal = () => {
    this.authS.loginRequest$.emit();
  };

  logout = (): void => {
    this.authS.logout();
  };

  changePassword = () => {
    this.reqS.http.post(
      `${ROOT_API_URL}/api/auth/reset_password/`,
      {email: this.authS.user.user.email},
      this.reqS.options
    )
      .map(this.reqS.extractData)
      .catch(this.reqS.handleError)
      .subscribe(
        _ => {
          this.notiS.notificate(new SimpleTextNotification(
            NotificationTypeEnum.SUCCESS,
            'Успешно!',
            '<div class="alert alert-success login-error">' +
              '<span class="glyphicon glyphicon glyphicon-ok-sign" aria-hidden="true">' +
              '</span>На ваш email выслано письмо с дальнейшими инструкциями по смене пароля' +
            '</div>'
          ))
        },
        error => {
          this.notiS.notificateError(error);
          console.log(error)
        })
  }

}
