import {Component, OnInit} from '@angular/core';
import {RequestsService} from "../../services/requests.service";
import {MonthlyRating, AvailableRating} from "../../models/rating/rating";
import {ROOT_API_URL, DEBOUNCE_TIME} from "../../../settings";
import {displayableMonth} from "../../common/functions";
import {RegionsService} from "../../services/regions.service";
import {AuthenticationService} from "../../services/authentication.service";
import {Subject} from "rxjs";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
  selector: 'rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.sass']
})
export class RatingComponent implements OnInit {
  private availableYearMonths: Map<number, number[]>;

  pendingSaves = {};
  valueChangeWatchers = {};

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
      text: 'Замечания<br>районов'
    }
  ];
  displayableMonth = displayableMonth;
  currentRatingUrl = `${ROOT_API_URL}/api/ratings/monthly/current/`;
  availableRatingsUrl = `${ROOT_API_URL}/api/ratings/monthly/`;
  loadedRating: MonthlyRating;
  availableRatings: AvailableRating[];
  availableRatingsLoaded: boolean;
  pickedYear: number;
  pickedMonth: number;
  availableYears: number[];
  availableMonths: number[];

  constructor(private reqS: RequestsService,
              public regionsS: RegionsService,
              public auth: AuthenticationService) {
    this.availableRatings = [];
    this.availableYears = [];
    this.availableMonths = [];
  }

  ngOnInit() {
    this.loadRating(this.currentRatingUrl);
  }

  loadRating = (url) => {
    this.reqS.http.get(
      url,
      this.reqS.options
    )
      .map(this.reqS.extractData)
      .catch(this.reqS.handleError)
      .subscribe(
        data => {
          this.loadedRating = new MonthlyRating(data);
          console.log(this.loadedRating.elements[0].additional_description);
          this.setNewElementsChangeWatchers();
          this.pickedYear = this.loadedRating.year;
          this.pickedMonth = this.loadedRating.month;
          if (!this.availableRatingsLoaded) {
            this.loadAvailableRatings();
          }
          if (this.isLocalStorageHeadersValid()) {
            this.headers = JSON.parse(localStorage.getItem('ratingHeadersDisplay'))
          }
        },
        error => {
          console.log(error);
        }
      )
  };

  emitElementChange = (elementId, property, value) => {
    console.log(elementId, property, value);
    this.pendingSaves[property] = true;
    this.valueChangeWatchers[elementId][property].next([elementId, property, value])
  };

  setNewElementsChangeWatchers = () => {
    for (let element of this.loadedRating.elements) {
      if (this.auth.user && element.responsible.id === this.auth.user.id) {
        this.valueChangeWatchers[element.id] = {
          'region_comment': new Subject()
        };
        this.valueChangeWatchers[element.id]['region_comment']
          .debounceTime(DEBOUNCE_TIME)
          .distinctUntilChanged()
          .subscribe(event =>
            this.saveElementProperty(event)
          )
      }
      if (this.auth.user && this.auth.user.can_approve_rating) {
        this.valueChangeWatchers[element.id] = {
          'negotiator_comment': new Subject()
        };
        this.valueChangeWatchers[element.id]['negotiator_comment']
          .debounceTime(DEBOUNCE_TIME)
          .distinctUntilChanged()
          .subscribe(event =>
            this.saveElementProperty(event)
          )
      }
      if (this.auth.user && this.auth.user.role === 'admin') {
        this.valueChangeWatchers[element.id] = {
          'additional_description': new Subject()
        };
        this.valueChangeWatchers[element.id]['additional_description']
          .debounceTime(DEBOUNCE_TIME)
          .distinctUntilChanged()
          .subscribe(event =>
            this.saveElementProperty(event)
          )
      }
    }
  };

  loadAvailableRatings = () => {
    this.reqS.http.get(
      this.availableRatingsUrl,
      this.reqS.options
    )
      .map(this.reqS.extractData)
      .catch(this.reqS.handleError)
      .subscribe(
        data => {
          for (let rating of data) {
            this.availableRatings.push(new AvailableRating(rating))
          }
          this.availableYearMonths = AvailableRating.getYearsAndMonthsList(this.availableRatings);
          for (let year in this.availableYearMonths) {
            this.availableYears.push(parseInt(year, 10))
          }
          this.availableMonths = this.availableYearMonths[this.loadedRating.year];
          this.availableRatingsLoaded = true;
        },
        error => {
          console.log(error);
        }
      )
  };

  yearPicked = (year) => {
    if (this.pickedYear !== year) {
      this.pickedYear = year;
      this.pickedMonth = null;
      this.availableMonths = this.availableYearMonths[year]
    }
  };

  monthPicked = (month) => {
    this.pickedMonth = month;
    let pickedRatingId = AvailableRating.getIdByYearAndMonth(
      this.pickedYear,
      this.pickedMonth,
      this.availableRatings
    );
    if (pickedRatingId !== this.loadedRating.id) {
      this.loadRating(`${this.availableRatingsUrl}${pickedRatingId}/`)
    }
  };

  displayAllHeaders = () => {
    for (let header in this.headers) {
      if (this.headers.hasOwnProperty(header)) {
        this.headers[header].is_displayed = true;
      }
    }
    localStorage.setItem('ratingHeadersDisplay', JSON.stringify(this.headers));
  };

  displayAllRegions = () => {
    for (let region in this.regionsS.regions) {
      if (this.regionsS.regions.hasOwnProperty(region)) {
        this.regionsS.regions[region].is_displayed = true;
      }
    }
    localStorage.setItem('regionsDisplay', JSON.stringify(this.regionsS.regions))
  };

  toggleHeader = (header) => {
    header.is_displayed = !header.is_displayed;
    localStorage.setItem('ratingHeadersDisplay', JSON.stringify(this.headers))
  };

  toggleRegion = (region) => {
    region.is_displayed = !region.is_displayed;
    localStorage.setItem('regionsDisplay', JSON.stringify(this.regionsS.regions))
  };

  isLocalStorageHeadersValid = () => {
    let localStorageHeaders = JSON.parse(localStorage.getItem('ratingHeadersDisplay'));
    if (localStorageHeaders === null) {
      return false;
    }
    if (this.headers.length !== localStorageHeaders.length) {
      localStorage.removeItem('ratingHeadersDisplay');
      return false;
    } else {
      for (let header in this.headers) {
        if (this.headers[header].text !== localStorageHeaders[header].text) {
          localStorage.removeItem('ratingHeadersDisplay');
          return false;
        }
      }
    }
    return true
  };

  saveElementProperty = ([elementId, property, $event]) => {
    let url = `${ROOT_API_URL}/api/ratings/monthly/elements/${elementId}/${property}/`;
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
          this.pendingSaves[property] = false;
        },
        error => {
          console.log(error);
        }
      );
  }

}
