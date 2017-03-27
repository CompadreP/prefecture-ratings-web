import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subject} from "rxjs";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import {RequestsService} from "../../../common/services/requests.service";
import {MonthlyRatingFull, AvailableRating} from "../rating.models";
import {ROOT_API_URL, DEBOUNCE_TIME} from "../../../../settings";
import {RegionsService} from "../../../common/services/regions.service";
import {AuthenticationService} from "../../authentication/authentication.service";
import {PrefectureEmployeesService} from "../../../common/services/employees.service";
import {NotificationService} from "../../notification/notification.service";
import {AreYouSureSimpleNotification} from "../../notification/notification.models";
import {BaseTableComponent} from "../base-table.component";
import {AvailableRatingsService} from "../available-ratings.service";
import {ActivatedRoute, Params} from "@angular/router";
import {MonthlyRatingService} from "./monthly-rating.service";

@Component({
  selector: 'rating',
  templateUrl: 'monthly-rating.component.html',
  styleUrls: ['monthly-rating.component.sass']
})
export class RatingComponent extends BaseTableComponent implements OnInit, OnDestroy {
  _elementSaveUrl: string = `${ROOT_API_URL}/api/ratings/monthly/elements/`;
  _localStorageHeadersKey: string = 'ratingHeadersDisplay';
  headers = [
    {
      is_displayed: true,
      text: 'Ответственный'
    },
    {
      is_displayed: true,
      text: 'Средний'
    },
    {
      is_displayed: true,
      text: 'Описание<br>показателя'
    },
    {
      is_displayed: true,
      text: 'Комментарии<br>согласовывающего'
    },
    {
      is_displayed: true,
      text: 'Информация о <br>замечаниях районов'
    }
  ];
  loadedRating: MonthlyRatingFull = null;

  pickedYear: number;
  pickedMonth: number;

  constructor(public reqS: RequestsService,
              public regionsS: RegionsService,
              public auth: AuthenticationService,
              public prefempS: PrefectureEmployeesService,
              public availratS: AvailableRatingsService,
              public notiS: NotificationService,
              private monthratS: MonthlyRatingService,
              private route: ActivatedRoute) {
    super(regionsS, reqS, notiS);
  }

  ngOnInit() {
    this.route.params
      .switchMap((params: Params) => this.monthratS.loadMonthlyRating(+params['id']))
      .map(this.reqS.extractData)
      .catch(this.reqS.handleError)
      .subscribe(
        data => {
          //console.log(data);
          this.loadedRating = new MonthlyRatingFull(data);
          //console.log(this.loadedRating);
          this.proceedLoadedRating();
        },
        error => {
          this.notiS.notificateError(error);
          console.log(error);
        });
    if (this.auth.user && this.auth.user.role === 'admin' && this.prefempS.employees.length === 0) {
      this.prefempS.loadEmployees()
    }
  }

  private proceedLoadedRating = (): void => {
    if (!this.loadedRating.is_negotiated && !this.loadedRating.is_approved) {
      this.loadedRating.state = this.ratingStates.on_negotiation
    } else if (this.loadedRating.is_negotiated && !this.loadedRating.is_approved) {
      this.loadedRating.state = this.ratingStates.negotiated
    } else if (this.loadedRating.is_negotiated && this.loadedRating.is_approved) {
      this.loadedRating.state = this.ratingStates.approved
    }
    if (this.loadedRating.elements) {
      for (let element of this.loadedRating.elements) {
        element.updateCalculatedFields();
        this.pendingSaves[element.id] = {}
      }
    }
    this.setNewElementsChangeWatchers();
    this.pickedYear = this.loadedRating.year;
    this.pickedMonth = this.loadedRating.month;
    if (this.isLocalStorageHeadersValid()) {
      this.headers = JSON.parse(localStorage.getItem(this._localStorageHeadersKey))
    }
    this.availratS.availableMonths = [];
    for (let month of this.availratS.availableYearMonths[this.pickedYear]) {
      this.availratS.availableMonths.push(month)
    }
  };

  private setNewElementsChangeWatchers = (): void => {
    for (let element of this.loadedRating.elements) {
      if (this.auth.user && element.responsible.id === this.auth.user.id) {
        this._valueChangeWatchers[element.id] = {
          'region_comment': new Subject()
        };
        this._valueChangeWatchers[element.id]['region_comment']
          .debounceTime(DEBOUNCE_TIME)
          .distinctUntilChanged()
          .subscribe(event =>
            this.saveElementProperty(event)
          )
      }
      if (this.auth.user && this.auth.user.can_approve_rating) {
        this._valueChangeWatchers[element.id] = {
          'negotiator_comment': new Subject()
        };
        this._valueChangeWatchers[element.id]['negotiator_comment']
          .debounceTime(DEBOUNCE_TIME)
          .distinctUntilChanged()
          .subscribe(event =>
            this.saveElementProperty(event)
          )
      }
      if (this.auth.user && this.auth.user.role === 'admin') {
        this._valueChangeWatchers[element.id] = {
          'additional_description': new Subject()
        };
        this._valueChangeWatchers[element.id]['additional_description']
          .debounceTime(DEBOUNCE_TIME)
          .distinctUntilChanged()
          .subscribe(event =>
            this.saveElementProperty(event)
          )
      }
    }
  };

  private saveRatingState = (state): void => {
    //console.log(state);
    let url = `${ROOT_API_URL}/api/ratings/monthly/${this.loadedRating.id}/change_state/`;
    let data = {};
    if (state == this.ratingStates.negotiated) {
      data['is_negotiated'] = true
    }
    if (state == this.ratingStates.approved) {
      data['is_approved'] = true
    }
    this.reqS.http.patch(
      url,
      data,
      this.reqS.options
    )
      .map(this.reqS.extractData)
      .catch(this.reqS.handleError)
      .subscribe(
        _ => {
          this.loadedRating.state = state;
          if (state == this.ratingStates.negotiated) {
            this.loadedRating.is_negotiated = true;
          } else if (state == this.ratingStates.approved) {
            this.loadedRating.is_approved = true;
          }
        },
        error => {
          this.notiS.notificateError(error);
          console.log(error);
        }
      );

  };

  public yearPicked = (year): void => {
    if (this.pickedYear !== year) {
      this.pickedYear = year;
      this.pickedMonth = null;
      this.availratS.availableMonths = [];
      for (let month of this.availratS.availableYearMonths[this.pickedYear]) {
        this.availratS.availableMonths.push(month)
      }
    }
  };

  public monthPicked = (month): void => {
    this.pickedMonth = month;
    let pickedRatingId = AvailableRating.getIdByYearAndMonth(
      this.pickedYear,
      this.pickedMonth,
      this.availratS.availableRatings
    );
    if (pickedRatingId !== this.loadedRating.id) {
    this.monthratS.loadMonthlyRating(+pickedRatingId)
      .map(this.reqS.extractData)
      .catch(this.reqS.handleError)
      .subscribe(
        data => {
          this.loadedRating = new MonthlyRatingFull(data);
          this.proceedLoadedRating();
        },
        error => {
          this.notiS.notificateError(error);
          console.log(error);
        });
    }
  };

  public changeRatingState = (state): void => {
    if (!this._subscriptions['notificationOkSubscription']) {
      this._subscriptions['notificationOkSubscription'] = this.notiS.notificationOk$.subscribe(
        () => {
          this.saveRatingState(state);
          this.notiS.hideModalAndUnsubscribe(this._subscriptions, this.notificationSubscriptionKeys);
        }
      );
    }
    if (!this._subscriptions['notificationCancelSubscription']) {
      this._subscriptions['notificationCancelSubscription'] = this.notiS.notificationCancel$.subscribe(
        () => {
          this.notiS.hideModalAndUnsubscribe(this._subscriptions, this.notificationSubscriptionKeys);
        }
      );
    }
    this.notiS.notificate(new AreYouSureSimpleNotification())
  };

}
