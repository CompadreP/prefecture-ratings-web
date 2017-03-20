import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import 'rxjs/add/operator/switchMap';

import {displayableMonth} from "../../../common/functions";
import {RatingElementsService} from "../../../services/rating-element.service";
import {RequestsService} from "../../../services/requests.service";
import {
  MonthlyRatingElement,
  MonthlyRatingSubElement
} from "../../../models/rating/rating";
import {PrefectureEmployeesService} from "../../../services/employees.service";
import {AuthenticationService} from "../../../services/authentication.service";
import {BaseTableComponent} from "../base-table.component";
import {RegionsService} from "../../../services/regions.service";

@Component({
  selector: 'rating-element',
  templateUrl: './rating-element.component.html',
  styleUrls: ['./rating-element.component.sass']
})
export class RatingElementComponent extends BaseTableComponent implements OnInit {
  _elementSaveUrl = '/api/ratings/monthly/sub_elements/';
  _localStorageHeadersKey = 'ratingElementsHeadersDisplay';
  headers = [
    {
      is_displayed: true,
      text: 'Ответственный'
    },
    {
      is_displayed: true,
      text: 'лучш'
    },
    {
      is_displayed: true,
      text: 'лучш'
    },
    {
      is_displayed: true,
      text: 'мин'
    },
    {
      is_displayed: true,
      text: 'макс'
    },
    {
      is_displayed: true,
      text: 'Описание<br>показателя'
    },
    {
      is_displayed: true,
      text: 'Ссылка на<br>документ&#8209;основание'
    }
  ];
  loadedRatingElement: MonthlyRatingElement = null;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private ratingelS: RatingElementsService,
              public reqS: RequestsService,
              public regionsS: RegionsService,
              public auth: AuthenticationService,
              public prefempS: PrefectureEmployeesService) {
    super(regionsS, reqS);
  }

  ngOnInit() {
    this.route.params
      .switchMap((params: Params) => this.ratingelS.loadRatingElement(+params['id'], true))
      .map(this.reqS.extractData)
      .subscribe(
        data => {
          console.log(data);
          this.loadedRatingElement = new MonthlyRatingElement(data);
          console.log(this.loadedRatingElement);
          if (!this.loadedRatingElement.monthly_rating.is_negotiated && !this.loadedRatingElement.monthly_rating.is_approved) {
            this.loadedRatingElement.monthly_rating.state = this.ratingStates.on_negotiation
          } else if (this.loadedRatingElement.monthly_rating.is_negotiated && !this.loadedRatingElement.monthly_rating.is_approved) {
            this.loadedRatingElement.monthly_rating.state = this.ratingStates.negotiated
          } else if (this.loadedRatingElement.monthly_rating.is_negotiated && this.loadedRatingElement.monthly_rating.is_approved) {
            this.loadedRatingElement.monthly_rating.state = this.ratingStates.approved
          }
        },
        error => {
          console.log(error);
        }
      )
  }

  addSubElement = () => {
    this.loadedRatingElement.related_sub_elements.push(new MonthlyRatingSubElement())
  }

}
