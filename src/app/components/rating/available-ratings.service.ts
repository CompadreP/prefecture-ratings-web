/**
 * Created by evgeniy on 2017-03-25.
 */

/**
 * Created by evgeniy on 2017-03-13.
 */
import {Injectable} from "@angular/core";
import {RequestsService} from "../../common/services/requests.service";
import {ROOT_API_URL} from "../../../settings";
import {AvailableRating} from "./rating.models";
import {NotificationService} from "../notification/notification.service";

@Injectable()
export class AvailableRatingsService {
  private availableRatingsUrl = `${ROOT_API_URL}/api/ratings/monthly/`;

  availableRatings: AvailableRating[];
  availableYears: number[];
  availableMonths: number[];
  availableYearMonths: Map<number, number[]>;

  constructor(private reqS: RequestsService,
              private notiS: NotificationService) {
    this.availableRatings = [];
    this.availableYears = [];
    this.availableMonths = [];
    this.availableYearMonths = new Map();
    this.loadAvailableRatings();
  }

  private loadAvailableRatings = (): void => {
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
          // console.log(this.availableYearMonths);
          for (let year in this.availableYearMonths) {
            this.availableYears.push(parseInt(year, 10));
          }
        },
        error => {
          this.notiS.notificateError(error);
          console.log(error);
        }
      )
  };
}
