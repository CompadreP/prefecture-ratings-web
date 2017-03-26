/**
 * Created by evgeniy on 2017-03-20.
 */

import {Injectable} from "@angular/core";
import {ROOT_API_URL} from "../../settings";
import {RequestsService} from "./requests.service";

@Injectable()
export class MonthlyRatingService {
  private url: string = `${ROOT_API_URL}/api/ratings/monthly/`;

  constructor(private reqS: RequestsService) {
  }

  loadMonthlyRating = (ratingId) => {
    let url = `${this.url}${ratingId}/`;
    return this.reqS.http.get(
      url,
      this.reqS.options
    )
      .catch(this.reqS.handleError);
  };
}
