import { Component, OnInit } from '@angular/core';
import {RequestsService} from "../../services/requests.service";
import {ROOT_API_URL} from "../../../settings";
import {Router} from "@angular/router";

@Component({
  selector: 'current-rating-loader',
  template: ''
})
export class CurrentRatingLoaderComponent implements OnInit {
  private currentRatingUrl = `${ROOT_API_URL}/api/ratings/monthly/current/`;

  constructor(private reqS: RequestsService,
              private router: Router) {
  }

  ngOnInit() {
    this.reqS.http.get(
      this.currentRatingUrl,
      this.reqS.options
    )
      .map(this.reqS.extractData)
      .catch(this.reqS.handleError)
      .subscribe(
        data => {
          this.router.navigate(['/rating', data['id']])
        },
        error => {
          console.log(error);
        })
  }

}
