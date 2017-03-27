import { Component, OnInit } from '@angular/core';
import {RequestsService} from "../../../common/services/requests.service";
import {ROOT_API_URL} from "../../../../settings";
import {Router} from "@angular/router";
import {NotificationService} from "../../notification/notification.service";

@Component({
  selector: 'current-rating-loader',
  template: ''
})
export class CurrentRatingLoaderComponent implements OnInit {
  private currentRatingUrl = `${ROOT_API_URL}/api/ratings/monthly/current/`;

  constructor(private reqS: RequestsService,
              private router: Router,
              private notiS: NotificationService) {
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
          console.log(data);
          this.router.navigate(['/rating', data['id']])
        },
        error => {
          this.notiS.notificateError(error);
          console.log(error);
        })
  }

}
