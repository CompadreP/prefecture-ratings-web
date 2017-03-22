import {Component, OnInit, ViewChild} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import 'rxjs/add/operator/switchMap';

import {ContextMenuService, ContextMenuComponent} from 'angular2-contextmenu';

import {displayableMonth, generateGuid} from "../../../common/functions";
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
import {ROOT_API_URL} from "../../../../settings";


@Component({
  selector: 'rating-element',
  templateUrl: './rating-element.component.html',
  styleUrls: ['./rating-element.component.sass']
})
export class RatingElementComponent extends BaseTableComponent implements OnInit {
  _elementSaveUrl = `${ROOT_API_URL}/api/ratings/monthly/sub_elements/`;
  _localStorageHeadersKey = 'ratingElementsHeadersDisplay';
  userCanChangeElement: boolean;

  @ViewChild('valueMenu') valueMenu: ContextMenuComponent;

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
          this.userCanChangeElement = this.checkIfUserCanChangeElement()
        },
        error => {
          console.log(error);
        }
      );
  }

  checkIfUserCanChangeElement = (): boolean => {
    return this.auth.user
      && (this.auth.user.id === this.loadedRatingElement.responsible.id)
      && !this.loadedRatingElement.monthly_rating.is_approved
  };

  userCanChangeSubElement = (subElement: MonthlyRatingSubElement): boolean => {
    return this.auth.user
      && ((this.auth.user.id === subElement.responsible.id)
      || (this.auth.user.id === this.loadedRatingElement.responsible.id))
      && !this.loadedRatingElement.monthly_rating.is_approved
  };

  displayableDisplayType = (displayType): string => {
    if (displayType === 1) {
      return 'число'
    } else if (displayType === 2) {
      return 'процент'
    }
  };

  displayableMinMaxType = (displayType): string => {
    if (displayType === 1) {
      return 'мин'
    } else if (displayType === 2) {
      return 'макс'
    }
  };

  emitElementChange = (elementId) => {
    //this.pendingSaves[elementId] = true;
    //this._valueChangeWatchers[elementId][property].next([elementId, property, value])
  };

  addSubElement = (): void => {
    let newSubElement = new MonthlyRatingSubElement();
    newSubElement.tempId = generateGuid();
    newSubElement.responsible = this.loadedRatingElement.responsible;
    newSubElement.best_type = 1;
    newSubElement.display_type = 1;
    for (let region of this.regionsS.regions) {
      newSubElement.values[region.id] = new MonthlyRatingSubElementValue()
    }
    this.loadedRatingElement.related_sub_elements.push(newSubElement);
    newSubElement.isUnsaved = true;
  };

  removeSubElement = (subElement: MonthlyRatingSubElement): void => {
    if (subElement.tempId) {
      this.loadedRatingElement.related_sub_elements.forEach((item, index) => {
        if (item.tempId === subElement.tempId) {
          this.loadedRatingElement.related_sub_elements.splice(index, 1);
        }
      })
    } else if (subElement.id) {
      //TODO
    }
    subElement.isUnsaved = true;
  };

  changeElementProperty = (subElement: MonthlyRatingSubElement,
                           property: string,
                           value): void => {
    subElement[property] = value;
    subElement.isUnsaved = true;
    if (['best_type'].indexOf(property) > -1) {
      subElement.updateCalculatedFields();
    }
  };

  changeValueInput = (subElement: MonthlyRatingSubElement,
                      elementValueObject: MonthlyRatingSubElementValue,
                      scalarValue: string): void => {
    if ((scalarValue !== null) && (scalarValue !== '')) {
      let regex = /^(\d{1,3}(,(\d{1,2})?)?)?$/;
      if (regex.test(scalarValue)) {
        let toNum = +scalarValue.replace(',', '.');
        if (toNum < -100 || toNum > 100) {
          elementValueObject.is_valid = false;
        } else {
          elementValueObject.value = toNum.toString().replace('.', ',');
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
    subElement.isUnsaved = true;
  };

  readFileToBase64 = (subElement: MonthlyRatingSubElement, $event): void => {
    let file: File = $event.target.files[0];
    let myReader: FileReader = new FileReader();
    myReader.onloadend = (_) => {
      subElement.document = myReader.result;
      subElement.documentFileName = $event.target.files[0].name;
    };
    myReader.readAsDataURL(file);
    subElement.isUnsaved = true;
  };

  removeDocument = (subElement: MonthlyRatingSubElement): void => {
    if (subElement.id && subElement.document) {
      // TODO send request on file delete
      subElement.document = null;
    } else if (subElement.tempId) {
      // Dirty hack
      let domEl = document.getElementById(`${subElement.tempId}-file`) as any;
      domEl.value = '';

      subElement.document = null;
      subElement.documentFileName = null;
    }
  };

  //dump

  saveAllChanges = (): void => {
    console.log(this.loadedRatingElement.related_sub_elements);
    for (let subElement of this.loadedRatingElement.related_sub_elements) {
      if (subElement.tempId) {
        // creating new subelement
        let data = {};
        data['name'] = subElement.name;
        // TODO
        data['date'] = null;
        data['responsible'] = subElement.responsible.id;
        data['best_type'] = subElement.best_type;
        data['description'] = subElement.description ? subElement.description : null;
        data['document'] = subElement.document ? subElement.document : null;
        data['values'] = [];
        for (let value of subElement.values) {
          if (subElement.values.hasOwnProperty(value)) {
            data['values'].push(
              {
                'region': value,
                'is_average': value.is_average,
                'value': value.is_average ? null : value.value
              }
            )
          }
        }
        console.log(data);
        let url = `${this._elementSaveUrl}?element_id=${this.loadedRatingElement.id}`;
        console.log(url);
        this.reqS.http.post(
          url,
          data,
          this.reqS.options
        )
          .map(this.reqS.extractData)
          .catch(this.reqS.handleError)
          .subscribe(
            response => {
              this.removeSubElement(subElement);
              this.loadedRatingElement.related_sub_elements.push(new MonthlyRatingSubElement(response));
              console.log(response)
            },
            error => {
              console.log(error);
            }
          )
      }
    }
  };

  setValueIsAverage = (subElement: MonthlyRatingSubElement,
                       value: MonthlyRatingSubElementValue,
                       isAverage: boolean) => {
    value.is_average = isAverage;
    subElement.updateCalculatedFields();
    subElement.isUnsaved = true;
  };

}
