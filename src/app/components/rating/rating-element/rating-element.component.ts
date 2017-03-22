import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import 'rxjs/add/operator/switchMap';

import {displayableMonth} from "../../../common/functions";
import {RatingElementsService} from "../../../services/rating-element.service";
import {RequestsService} from "../../../services/requests.service";
import {
  MonthlyRatingElement,
  MonthlyRatingSubElement, MonthlyRatingSubElementValue
} from "../../../models/rating/rating";
import {PrefectureEmployeesService} from "../../../services/employees.service";
import {AuthenticationService} from "../../../services/authentication.service";
import {BaseTableComponent} from "../base-table.component";
import {RegionsService} from "../../../services/regions.service";
import {register} from "ts-node/dist";

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
          this.loadedRatingElement = new MonthlyRatingElement(data);
          console.log(this.loadedRatingElement);
          if (!this.loadedRatingElement.monthly_rating.is_negotiated && !this.loadedRatingElement.monthly_rating.is_approved) {
            this.loadedRatingElement.monthly_rating.state = this.ratingStates.on_negotiation
          } else if (this.loadedRatingElement.monthly_rating.is_negotiated && !this.loadedRatingElement.monthly_rating.is_approved) {
            this.loadedRatingElement.monthly_rating.state = this.ratingStates.negotiated
          } else if (this.loadedRatingElement.monthly_rating.is_negotiated && this.loadedRatingElement.monthly_rating.is_approved) {
            this.loadedRatingElement.monthly_rating.state = this.ratingStates.approved
          }
          if (this.loadedRatingElement.monthly_rating.state !== this.ratingStates.approved) {
            if (this.auth.user && (this.auth.user.role === 'admin' || this.loadedRatingElement.responsible.id === this.auth.user.id) && this.prefempS.employees.length === 0) {
              this.prefempS.loadEmployees()
            }
          }
        },
        error => {
          console.log(error);
        }
      );
  }

  userCanChangeElement = () => {
    return this.auth.user
           && (this.auth.user.id === this.loadedRatingElement.responsible.id)
           && !this.loadedRatingElement.monthly_rating.is_approved
  };

  userCanChangeSubElement = (subElement) => {
    return this.auth.user
           && ((this.auth.user.id === subElement.responsible.id)
                || (this.auth.user.id === this.loadedRatingElement.responsible.id))
           && !this.loadedRatingElement.monthly_rating.is_approved
  };

  displayableValue = (value) => {
    value ? value.toString().replace('.', ',') : value
  };

  displayableDisplayType = (displayType) => {
    if (displayType === 1) {
      return 'число'
    } else if (displayType === 2) {
      return 'процент'
    }
  };

  displayableMinMaxType = (displayType) => {
    if (displayType === 1) {
      return 'мин'
    } else if (displayType === 2) {
      return 'макс'
    }
  };

  emitElementChange = (elementId) => {
    this.pendingSaves[elementId] = true;
    //this._valueChangeWatchers[elementId][property].next([elementId, property, value])
  };

  addSubElement = () => {
    let newSubElement = new MonthlyRatingSubElement();
    newSubElement.responsible = this.loadedRatingElement.responsible;
    newSubElement.best_type = 1;
    newSubElement.display_type = 1;
    for (let region of this.regionsS.regions) {
      newSubElement.values[region.id] = new MonthlyRatingSubElementValue()
    }
    this.loadedRatingElement.related_sub_elements.push(newSubElement)
  };

  changeNewElementResponsible = (element, newResponsible) => {
    element.responsible = newResponsible
  };

  changeValueInput = (subElement, elementValueObject, scalarValue: string) => {
    if ((scalarValue !== null) && (scalarValue !== '')) {
      let regex = /^(\d{1,3}(,(\d{1,2})?)?)?$/;
      if (regex.test(scalarValue)) {
        let toNum = +scalarValue.replace(',', '.');
        if (toNum < -100 || toNum > 100) {
          elementValueObject.is_valid = false;
        } else {
          elementValueObject.value = toNum;
          elementValueObject.is_valid = true;
        }
      } else {
        elementValueObject.is_valid = false;
      }
    } else {
      if (scalarValue === '') {
        scalarValue = null
      }
      elementValueObject.value = scalarValue;
      elementValueObject.is_valid = true;
    }
    if (elementValueObject.is_valid) {
      subElement.updateCalculatedFields();
    }
  };

}
