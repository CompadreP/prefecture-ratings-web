/**
 * Created by evgeniy on 2017-03-20.
 */

import {Injectable} from "@angular/core";
import {ROOT_API_URL} from "../../../../settings";
import {RequestsService} from "../../../common/services/requests.service";

@Injectable()
export class RatingElementsService {
  private url: string = `${ROOT_API_URL}/api/ratings/monthly/elements/`;

  constructor(private reqS: RequestsService) {
  }

  loadRatingElement = (elementId, includeRelatedSubElements) => {
    let url = `${this.url}${elementId}/`;
    if (includeRelatedSubElements) {
      url = `${url}?include_sub_elements=true`
    }
    return this.reqS.http.get(
      url,
      this.reqS.options
    )

  };

  loadRatingElementValues = (elementId) => {
    let url = `${this.url}${elementId}/values/`;
    return this.reqS.http.get(
      url,
      this.reqS.options
    )
  }
}
