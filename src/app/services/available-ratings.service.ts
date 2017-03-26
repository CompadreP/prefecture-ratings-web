/**
 * Created by evgeniy on 2017-03-25.
 */

/**
 * Created by evgeniy on 2017-03-13.
 */
import {Injectable} from "@angular/core";
import {RequestsService} from "./requests.service";
import {ROOT_API_URL} from "../../settings";
import {Region} from "../models/map";
import {AvailableRating} from "../models/rating/rating";

@Injectable()
export class AvailableRatingsService {
  private availableRatingsUrl = `${ROOT_API_URL}/api/ratings/monthly/`;

  availableRatings: AvailableRating[];
  availableYears: number[];
  availableMonths: number[];
  availableYearMonths: Map<number, number[]>;

  constructor(private reqS: RequestsService) {
    this.availableRatings = [];
    this.availableYears = [];
    this.availableMonths = [];
    this.availableYearMonths = new Map();
    this.loadAvailableRatings();
  }

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
        },
        error => {
          console.log(error);
        }
      )
  };
}
