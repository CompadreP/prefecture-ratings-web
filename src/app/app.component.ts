import {Component, OnInit} from '@angular/core';

import {AuthenticationService} from "./services/authentication.service";
import {UserAuth} from "./common/classes/user_auth";
import {RequestsService} from "./services/requests.service";
import {NotificationService} from "./services/notification.service";
import {Notification, NotificationTypeEnum} from "./models/notification";
import {RegionsService} from "./services/regions.service";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  providers: [
    AuthenticationService,
    RequestsService,
    NotificationService,
    RegionsService
  ]
})
export class AppComponent implements OnInit {
  auth: UserAuth;

  constructor(private authenticationService: AuthenticationService,
              private requestsService: RequestsService,
              private notificationService: NotificationService) {
    this.auth = new UserAuth(authenticationService);
  }

  ngOnInit() {
    this.authenticationService.checkExistingAuth();
    this.requestsService.serverUnavailable$.subscribe(
      _ => {
        this.notificationService.notificate(new Notification(
        NotificationTypeEnum.INFO,
        'Ошибка!',
        'К сожалению в данный момент сервер недоступен, попробуйте позже',
        true,
        false
        ))
      }
    )
  }

}
