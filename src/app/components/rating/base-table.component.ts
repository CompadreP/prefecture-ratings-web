/**
 * Created by evgeniy on 2017-03-20.
 */

import {displayableMonth} from "../../common/functions";
import {OnDestroy} from "@angular/core";
import {RegionsService} from "../../common/services/regions.service";
import {RequestsService} from "../../common/services/requests.service";
import {NotificationService} from "../notification/notification.service";

export abstract class BaseTableComponent implements OnDestroy {
  abstract _elementSaveUrl: string;
  abstract _localStorageHeadersKey: string;
  abstract headers;
  _subscriptions;
  _valueChangeWatchers;
  displayableMonth = displayableMonth;
  pendingSaves;
  ratingStates = {
    on_negotiation: 'Рейтинг на согласовании',
    negotiated: 'Рейтинг согласован',
    approved: 'Рейтинг утвержден'
  };
  notificationSubscriptionKeys = ['notificationOkSubscription', 'notificationCancelSubscription'];

  constructor(public regionsS: RegionsService,
              public reqS: RequestsService,
              public notiS: NotificationService) {
    this._subscriptions = {};
    this._valueChangeWatchers = {};
    this.pendingSaves = {}
  }

  ngOnDestroy() {
    for (let sub in this._subscriptions) {
      if (this._subscriptions.hasOwnProperty(sub)) {
        this._subscriptions[sub].unsubscribe();
        delete this._subscriptions[sub];
      }
    }
  }

  public isLocalStorageHeadersValid = (): boolean => {
    let localStorageHeaders = JSON.parse(localStorage.getItem(this._localStorageHeadersKey));
    if (!localStorageHeaders) {
      return false;
    }
    if (this.headers.length !== localStorageHeaders.length) {
      localStorage.removeItem(this._localStorageHeadersKey);
      return false;
    } else {
      for (let header in this.headers) {
        if (this.headers.hasOwnProperty(header)) {
          if (this.headers[header].text !== localStorageHeaders[header].text) {
            localStorage.removeItem(this._localStorageHeadersKey);
            return false;
          }
        }
      }
    }
    return true
  };

  public emitElementChange = (elementId, property, value): void => {
    this.pendingSaves[elementId][property] = true;
    this._valueChangeWatchers[elementId][property].next([elementId, property, value])
  };

  public displayAllRegions = (): void => {
    for (let region in this.regionsS.regions) {
      if (this.regionsS.regions.hasOwnProperty(region)) {
        this.regionsS.regions[region].is_displayed = true;
      }
    }
    localStorage.setItem('regionsDisplay', JSON.stringify(this.regionsS.regions))
  };

  public toggleRegion = (region): void => {
    region.is_displayed = !region.is_displayed;
    localStorage.setItem('regionsDisplay', JSON.stringify(this.regionsS.regions))
  };

  public saveElementProperty = ([elementId, property, value]): void => {
    let url = `${this._elementSaveUrl}${elementId}/`;
    let data = {};
    data[property] = value;
    this.reqS.http.patch(
      url,
      data,
      this.reqS.options
    )
      .map(this.reqS.extractData)
      .catch(this.reqS.handleError)
      .subscribe(
        _ => {
          this.pendingSaves[elementId][property] = false;
        },
        error => {
          this.notiS.notificateError(error);
          console.log(error);
        }
      );
  };

  public changeElementResponsibleAndSave = (element, newResponsible): void => {
    this.pendingSaves[element.id]['responsible'] = true;
    this.saveElementProperty([element.id, 'responsible', newResponsible.id]);
    element.responsible = newResponsible
  };

  public displayAllHeaders = (): void => {
    for (let header in this.headers) {
      if (this.headers.hasOwnProperty(header)) {
        this.headers[header].is_displayed = true;
      }
    }
    localStorage.setItem(this._localStorageHeadersKey, JSON.stringify(this.headers));
  };

  public toggleHeader = (header): void => {
    header.is_displayed = !header.is_displayed;
    localStorage.setItem(this._localStorageHeadersKey, JSON.stringify(this.headers))
  };

  public displayableDisplayType = (displayType): string => {
    if (displayType === 1) {
      return 'число'
    } else if (displayType === 2) {
      return 'процент'
    }
  };

  public displayableMinMaxType = (displayType): string => {
    if (displayType === 1) {
      return 'мин'
    } else if (displayType === 2) {
      return 'макс'
    }
  };

}
