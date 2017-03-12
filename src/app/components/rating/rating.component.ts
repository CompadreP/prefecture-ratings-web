import {Component, OnInit} from '@angular/core';
import {Http} from "@angular/http";

import {RequestsHandler} from "../../common/classes/requests_handler";
import {MonthlyRating, AvailableRating} from "../../models/rating/rating";
import {ROOT_API_URL} from "../../../settings";
import {displayableMonth} from "../../common/functions";

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.sass'],
  providers: [RequestsHandler]
})
export class RatingComponent implements OnInit {
  displayableMonth = displayableMonth;
  currentRatingUrl = `${ROOT_API_URL}/api/ratings/monthly/current/`;
  availableRatingsUrl = `${ROOT_API_URL}/api/ratings/monthly/`;
  loadedRating: MonthlyRating;
  availableRatings: AvailableRating[];
  availableRatingsLoaded: boolean;
  requestsHandler: RequestsHandler;
  pickedYear: number;
  pickedMonth: number;

  private availableYearMonths: Map<number, number[]>;
  availableYears: number[];
  availableMonths: number[];

  constructor(private http: Http) {
    this.requestsHandler = new RequestsHandler(http);
    this.availableRatings = [];
    this.availableYears = [];
    this.availableMonths = [];
  }

  ngOnInit() {
    this.loadRating(this.currentRatingUrl);
  }

  loadRating(url) {
    this.requestsHandler.http.get(
      url,
      this.requestsHandler.options
    )
      .map(this.requestsHandler.extractData)
      .catch(this.requestsHandler.handleError)
      .subscribe(
        data => {
          this.loadedRating = new MonthlyRating(data);
          this.pickedYear = this.loadedRating.year;
          this.pickedMonth = this.loadedRating.month;
          if (!this.availableRatingsLoaded) {
            this.loadAvailableRatings();
          }
        },
        error => {
          console.log(error);
        }
      )
  }

  loadAvailableRatings() {
    this.requestsHandler.http.get(
      this.availableRatingsUrl,
      this.requestsHandler.options
    )
      .map(this.requestsHandler.extractData)
      .catch(this.requestsHandler.handleError)
      .subscribe(
        data => {
          for (let rating of data) {
            this.availableRatings.push(new AvailableRating(rating))
          }
          this.availableYearMonths = AvailableRating.getYearsMonthsList(this.availableRatings);
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
  }

  yearPicked(year) {
    this.pickedYear = year;
    this.pickedMonth = null;
    this.availableMonths = this.availableYearMonths[year]
  }

  monthPicked(month) {
    this.pickedMonth = month;
    let pickedRatingId = AvailableRating.getIdByYearAndMonth(
      this.pickedYear,
      this.pickedMonth,
      this.availableRatings
    );
    if (pickedRatingId !== this.loadedRating.id) {
      this.loadRating(`${this.availableRatingsUrl}${pickedRatingId}/`)
    }
  }
}
