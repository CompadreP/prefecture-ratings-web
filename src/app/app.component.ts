import {Component, OnInit} from '@angular/core';

import {AuthenticationService} from "./components/authentication/authentication.service";
import {RequestsService} from "./common/services/requests.service";
import {NotificationService} from "./components/notification/notification.service";
import {
  ErrorNotification, Notification,
  NotificationTypeEnum
} from "./components/notification/notification.models";
import {RegionsService} from "./common/services/regions.service";
import {PrefectureEmployeesService} from "./common/services/employees.service";
import {RatingElementsService} from "./components/rating/rating-element/rating-element.service";
import {AvailableRatingsService} from "./components/rating/available-ratings.service";
import {MonthlyRatingService} from "./components/rating/monthly-rating/monthly-rating.service";


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
    AvailableRatingsService,
    MonthlyRatingService,
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
              private notiS: NotificationService,
              private ratingelS: RatingElementsService,
              public regionsS: RegionsService,
              public prefempS: PrefectureEmployeesService) {
  }

  ngOnInit() {
    this.checkVersion();
    this.authS.checkExistingAuth();
    this.reqS.serverUnavailable$.subscribe(
      error => {
        this.notiS.notificate(new ErrorNotification(error))
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
