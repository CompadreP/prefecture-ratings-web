import {Component, OnInit} from '@angular/core';
import {RequestsService} from "../../services/requests.service";
import {MonthlyRating, AvailableRating} from "../../models/rating/rating";
import {ROOT_API_URL} from "../../../settings";
import {displayableMonth} from "../../common/functions";
import {RegionsService} from "../../services/regions.service";
import {Region} from "../../models/map";

@Component({
  selector: 'rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.sass']
})
export class RatingComponent implements OnInit {
  displayableMonth = displayableMonth;
  currentRatingUrl = `${ROOT_API_URL}/api/ratings/monthly/current/`;
  availableRatingsUrl = `${ROOT_API_URL}/api/ratings/monthly/`;
  loadedRating: MonthlyRating;
  availableRatings: AvailableRating[];
  availableRatingsLoaded: boolean;
  pickedYear: number;
  pickedMonth: number;
  regions: Region[];

  private availableYearMonths: Map<number, number[]>;
  availableYears: number[];
  availableMonths: number[];

  constructor(private requestsService: RequestsService,
              private regionsService: RegionsService,) {
    this.availableRatings = [];
    this.availableYears = [];
    this.availableMonths = [];
    this.regionsService.regionsLoaded$.subscribe(
      regions => {
        this.regions = regions;
      }
    )

  }

  ngOnInit() {
    this.loadRating(this.currentRatingUrl);
  }

  loadRating = (url) => {
    this.requestsService.http.get(
      url,
      this.requestsService.options
    )
      .map(this.requestsService.extractData)
      .catch(this.requestsService.handleError)
      .subscribe(
        data => {
          this.loadedRating = new MonthlyRating(data);
          console.log(this.loadedRating);
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
  };

  loadAvailableRatings = () => {
    this.requestsService.http.get(
      this.availableRatingsUrl,
      this.requestsService.options
    )
      .map(this.requestsService.extractData)
      .catch(this.requestsService.handleError)
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
}
