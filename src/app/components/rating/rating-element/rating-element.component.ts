import {Component, OnInit, ViewChild} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import 'rxjs/add/operator/switchMap';

import {ContextMenuComponent} from 'angular2-contextmenu';

import {displayableMonth, generateGuid, getColor} from "../../../common/functions";
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
import {NotificationService} from "../../../services/notification.service";
import {AreYouSureSimpleNotification} from "../../../models/notification";


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
              private notiS: NotificationService,
              public reqS: RequestsService,
              public regionsS: RegionsService,
              public authS: AuthenticationService,
              public prefempS: PrefectureEmployeesService) {
    super(regionsS, reqS);
  }

  ngOnInit() {
    this.route.params
      .switchMap((params: Params) => this.ratingelS.loadRatingElement(+params['id'], true))
      .map(this.reqS.extractData)
      .subscribe(
        data => {
          console.log(data)
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
            if (this.authS.user && (this.authS.user.role === 'admin' || this.loadedRatingElement.responsible.id === this.authS.user.id) && this.prefempS.employees.length === 0) {
              this.prefempS.loadEmployees()
            }
          }
          this.userCanChangeElement = this.checkIfUserCanChangeElement();
          console.log(this.loadedRatingElement.related_sub_elements);
          for (let subElement of this.loadedRatingElement.related_sub_elements) {
            subElement.updateCalculatedFields();
          }
        },
        error => {
          console.log(error);
        }
      );
  }

  checkIfUserCanChangeElement = (): boolean => {
    return !!this.authS.user
      && (this.authS.user.id === this.loadedRatingElement.responsible.id)
      && !this.loadedRatingElement.monthly_rating.is_approved
  };

  userCanChangeSubElement = (subElement: MonthlyRatingSubElement): boolean => {
    return !!this.authS.user
      && ((this.authS.user.id === subElement.responsible.id)
      || (this.authS.user.id === this.loadedRatingElement.responsible.id))
      && !this.loadedRatingElement.monthly_rating.is_approved;
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
          return
        }
      })
    } else if (subElement.id) {
      if (!this._subscriptions['notificationOkSubscription']) {
        this._subscriptions['notificationOkSubscription'] = this.notiS.notificationOk$.subscribe(
          () => {
            this.reqS.http.delete(
              `${this._elementSaveUrl}${subElement.id}/`,
              this.reqS.options
            )
              .map(this.reqS.extractData)
              .catch(this.reqS.handleError)
              .subscribe(
                _ => {
                  this.loadedRatingElement.related_sub_elements.forEach((item, index) => {
                    if (item.id === subElement.id) {
                      this.loadedRatingElement.related_sub_elements.splice(index, 1);
                      return
                    }
                  })
                },
                error => {
                  console.log(error);
                }
              );
            this.notiS.hideModalAndUnsubscribe(this._subscriptions, this.notificationSubscriptionKeys);
          }
        );
      }
      if (!this._subscriptions['notificationCancelSubscription']) {
        this._subscriptions['notificationCancelSubscription'] = this.notiS.notificationCancel$.subscribe(
          () => {
            this.notiS.hideModalAndUnsubscribe(this._subscriptions, this.notificationSubscriptionKeys);
          }
        );
      }
      this.notiS.notificate(new AreYouSureSimpleNotification());
    }
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
      let regex = /^(-)?(\d{1,3}(,(\d{1,2})?)?)?$/;
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
    console.log('removing document!');
    if (subElement.isDocumentSaved) {
      if (!this._subscriptions['notificationOkSubscription']) {
        this._subscriptions['notificationOkSubscription'] = this.notiS.notificationOk$.subscribe(
          () => {
            this.reqS.http.patch(
              `${this._elementSaveUrl}${subElement.id}/`,
              {'document': null},
              this.reqS.options
            )
              .map(this.reqS.extractData)
              .catch(this.reqS.handleError)
              .subscribe(
                _ => {
                  subElement.document = null;
                },
                error => {
                  console.log(error);
                }
              );
            this.notiS.hideModalAndUnsubscribe(this._subscriptions, this.notificationSubscriptionKeys);
          }
        );
      }
      if (!this._subscriptions['notificationCancelSubscription']) {
        this._subscriptions['notificationCancelSubscription'] = this.notiS.notificationCancel$.subscribe(
          () => {
            this.notiS.hideModalAndUnsubscribe(this._subscriptions, this.notificationSubscriptionKeys);
          }
        );
      }
      this.notiS.notificate(new AreYouSureSimpleNotification());
    } else if (!subElement.isDocumentSaved) {
      // Dirty hack
      let subElementId = subElement.tempId ? subElement.tempId : subElement.id;
      let domEl = document.getElementById(`${subElementId}-file`) as any;
      domEl.value = '';
      subElement.document = null;
      subElement.documentFileName = null;
    }
  };

  saveAllChanges = (): void => {
    console.log(this.loadedRatingElement.related_sub_elements);
    for (let subElement of this.loadedRatingElement.related_sub_elements) {
      // TODO validation and notification on invalid values
      //preparing data
      let data = {};
      data['name'] = subElement.name;
      // TODO
      data['date'] = null;
      data['responsible'] = subElement.responsible.id;
      data['display_type'] = subElement.display_type;
      data['best_type'] = subElement.best_type;
      data['description'] = subElement.description ? subElement.description : null;
      data['document'] = subElement.document ? subElement.document : null;
      data['values'] = [];
      for (let value in subElement.values) {
        if (subElement.values.hasOwnProperty(value)) {
          let scalarValue;
          if (subElement.values[value].is_average) {
            scalarValue = null
          } else {
            if (subElement.display_type === 1) {
              scalarValue = subElement.values[value]._value ? subElement.values[value]._value : null
            } else if (subElement.display_type === 2) {
              scalarValue = subElement.values[value]._value ? subElement.values[value]._value / 100 : null
            }
          }
          let preparedValue = {
            'region': value,
            'is_average': !!subElement.values[value].is_average,
            'value': scalarValue,
          };
          if (subElement.values[value].id){
            preparedValue['id'] = subElement.values[value].id
          }
          data['values'].push(preparedValue)
        }
      }
      if (subElement.tempId) {
        // creating new subelement
        let url = `${this._elementSaveUrl}?element_id=${this.loadedRatingElement.id}`;
        this.reqS.http.post(
          url,
          data,
          this.reqS.options
        )
          .map(this.reqS.extractData)
          .catch(this.reqS.handleError)
          .subscribe(
            data => {
              this.removeSubElement(subElement);
              data.responsible = this.prefempS.getEmployeeById(data.responsible);
              for (let value of data.values) {
                value.is_valid = true;
              }
              let newSubElement = new MonthlyRatingSubElement(data);
              this.loadedRatingElement.related_sub_elements.push(newSubElement);
              newSubElement.updateCalculatedFields();
              console.log(newSubElement);
            },
            error => {
              console.log(error);
            }
          )
      } else if (subElement.id && subElement.isUnsaved) {
        let url = `${this._elementSaveUrl}${subElement.id}/`;
        console.log(data);
        this.reqS.http.patch(
          url,
          data,
          this.reqS.options
        )
          .map(this.reqS.extractData)
          .catch(this.reqS.handleError)
          .subscribe(
            _ => {
              subElement.isUnsaved = false
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
                       isAverage: boolean): void => {
    value.is_average = isAverage;
    subElement.updateCalculatedFields();
    subElement.isUnsaved = true;
  };

}
