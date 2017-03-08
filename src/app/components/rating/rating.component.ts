import {Component, OnInit} from '@angular/core';
import {Http} from "@angular/http";

import {RequestsHandler} from "../../common/classes/requests_handler";

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.sass'],
  providers: [RequestsHandler]
})
export class RatingComponent implements OnInit {
  currentRatingUrl = 'http://127.0.0.1:8000/api/ratings/monthly/current/';
  loadedRating: string;
  requestsHandler: RequestsHandler;

  constructor(private http: Http) {
    this.requestsHandler = new RequestsHandler(http)
  }

  ngOnInit() {
    this.requestsHandler.http.get(
      this.currentRatingUrl,
      this.requestsHandler.options
    )
      .map(this.requestsHandler.extractData)
      .catch(this.requestsHandler.handleError)
      .subscribe(
        data => {
          this.loadedRating = data;
          console.log(this.loadedRating)
        },
        error => {
          console.log(error);
        }
      )
  }

}
