/**
 * Created by evgeniy on 2017-03-20.
 */

import {displayableMonth} from "../../common/functions";
import {OnDestroy} from "@angular/core";
import {RegionsService} from "../../services/regions.service";
import {RequestsService} from "../../services/requests.service";

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

  constructor(public regionsS: RegionsService,
              public reqS: RequestsService) {
    this._subscriptions = {};
    this._valueChangeWatchers = {};
    this.pendingSaves = {}
  }

  ngOnDestroy() {
    for (let sub in this._subscriptions) {
      if (this._subscriptions.hasOwnProperty(sub)) {
        this._subscriptions[sub].unsubscribe()
      }
    }
  }

  emitElementChange = (elementId, property, value) => {
    this.pendingSaves[elementId][property] = true;
    this._valueChangeWatchers[elementId][property].next([elementId, property, value])
  };

  displayAllRegions = () => {
    for (let region in this.regionsS.regions) {
      if (this.regionsS.regions.hasOwnProperty(region)) {
        this.regionsS.regions[region].is_displayed = true;
      }
    }
    localStorage.setItem('regionsDisplay', JSON.stringify(this.regionsS.regions))
  };

  toggleRegion = (region) => {
    region.is_displayed = !region.is_displayed;
    localStorage.setItem('regionsDisplay', JSON.stringify(this.regionsS.regions))
  };

  saveElementProperty = ([elementId, property, $event]) => {
    let url = `${this._elementSaveUrl}${elementId}/`;
    let data = {};
    data[property] = $event;
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
          console.log(error);
        }
      );
  };

  changeElementResponsible = (element, newResponsible) => {
    this.pendingSaves[element.id]['responsible'] = true;
    this.saveElementProperty([element.id, 'responsible', newResponsible.id]);
    element.responsible = newResponsible
  };

  displayAllHeaders = () => {
    for (let header in this.headers) {
      if (this.headers.hasOwnProperty(header)) {
        this.headers[header].is_displayed = true;
      }
    }
    localStorage.setItem(this._localStorageHeadersKey, JSON.stringify(this.headers));
  };

  toggleHeader = (header) => {
    header.is_displayed = !header.is_displayed;
    localStorage.setItem(this._localStorageHeadersKey, JSON.stringify(this.headers))
  };

  isLocalStorageHeadersValid = () => {
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

}
