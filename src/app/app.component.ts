import {Component, OnInit} from '@angular/core';

import {AuthenticationService} from "./services/authentication.service";
import {RequestsService} from "./services/requests.service";
import {NotificationService} from "./services/notification.service";
import {Notification, NotificationTypeEnum} from "./models/notification";
import {RegionsService} from "./services/regions.service";
import {PrefectureEmployeesService} from "./services/employees.service";
import {RatingElementsService} from "./services/rating-element.service";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  providers: [
    AuthenticationService,
    RequestsService,
    NotificationService,
    RegionsService,
    PrefectureEmployeesService,
    RatingElementsService,
  ]
})
export class AppComponent implements OnInit {
  __version__ = '2';

  private migrations = [
    () => {
      console.log('migration 0')
    },
    () => {
      this.removeLocalStorageKeys(['ratingHeadersDisplay']);
      console.log('migration 1')
    },
    () => {
      console.log('migration 2')
    },
  ];

  constructor(private authS: AuthenticationService,
              private reqS: RequestsService,
              private notiS: NotificationService) {
  }

  ngOnInit() {
    this.checkVersion();
    this.authS.checkExistingAuth();
    this.reqS.serverUnavailable$.subscribe(
      _ => {
        this.notiS.notificate(new Notification(
          NotificationTypeEnum.INFO,
          'Ошибка!',
          'К сожалению в данный момент сервер недоступен, попробуйте позже',
          true,
          false
        ))
      }
    );
    this.reqS.requestForbidden$.subscribe(
      _ => {
        this.authS.user = null;
        this.removeLocalStorageKeys(['currentUser']);
        location.reload()
      }
    )
  }

  checkVersion = (): void => {
    if (localStorage.getItem('__version__') === null) {
      localStorage.clear();
      localStorage.setItem('__version__', this.__version__)
    }
    if (localStorage.getItem('__version__') !== this.__version__) {
      let clientVersion = Number(localStorage.getItem('__version__'));
      let currentVersion = Number(this.__version__);
      this.migrateToVersion(clientVersion, currentVersion)
    }
  };

  migrateToVersion = (from: number, to: number): void => {
    for (let num = 0; num < to - from; num++) {
      let migrationNum = from + num + 1;
      this.migrations[migrationNum]();
      localStorage.setItem('__version__', String(migrationNum))
    }
  };

  removeLocalStorageKeys = (keys: string[]): void => {
    for (let key of keys) {
      localStorage.removeItem(key)
    }
  };

}
