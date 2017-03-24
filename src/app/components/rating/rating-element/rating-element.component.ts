import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import 'rxjs/add/operator/switchMap';

import {ContextMenuComponent} from 'angular2-contextmenu';

import {generateGuid} from "../../../common/functions";
import {RatingElementsService} from "../../../services/rating-element.service";
import {RequestsService} from "../../../services/requests.service";
import {
  MonthlyRatingElement,
  MonthlyRatingSubElement,
  MonthlyRatingSubElementValue
} from "../../../models/rating/rating";
import {PrefectureEmployeesService} from "../../../services/employees.service";
import {AuthenticationService} from "../../../services/authentication.service";
import {BaseTableComponent} from "../base-table.component";
import {RegionsService} from "../../../services/regions.service";
import {ROOT_API_URL} from "../../../../settings";
import {NotificationService} from "../../../services/notification.service";
import {
  AreYouSureSimpleNotification,
  SimpleTextNotification, NotificationTypeEnum
} from "../../../models/notification";

declare let $: any;


@Component({
  selector: 'rating-element',
  templateUrl: './rating-element.component.html',
  styleUrls: ['./rating-element.component.sass']
})
export class RatingElementComponent extends BaseTableComponent implements OnInit, AfterViewInit {
  _elementSaveUrl = `${ROOT_API_URL}/api/ratings/monthly/sub_elements/`;
  _localStorageHeadersKey = 'ratingElementsHeadersDisplay';
  userCanChangeElement: boolean;
  userCanChangeOneOfSubelements: boolean;
  isFileUploading: boolean;

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
    this.isFileUploading = false;
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
          if (this.loadedRatingElement.monthly_rating.state !== this.ratingStates.approved) {
            if (this.authS.user && (this.authS.user.role === 'admin' || this.loadedRatingElement.responsible.id === this.authS.user.id) && this.prefempS.employees.length === 0) {
              this.prefempS.loadEmployees()
            }
          }
          this.userCanChangeElement = this.checkIfUserCanChangeElement();
          for (let subElement of this.loadedRatingElement.related_sub_elements) {
            if (this.userCanChangeSubElement(subElement)) {
              this.userCanChangeOneOfSubelements = true;
            }
            if (subElement.display_type === 2) {
              for (let value in subElement.values) {
                if (subElement.values.hasOwnProperty(value)) {
                  if (subElement.values[value]._value !== null && subElement.values[value]._value !== undefined) {
                    subElement.values[value]._value = Number((subElement.values[value]._value * 100).toFixed(2));
                  }
                }
              }
            }
            subElement.updateCalculatedFields();
            subElement.isSaved = true;
            subElement.isDocumentSaved = true;
          }
        },
        error => {
          console.log(error);
        }
      );
  }

  ngAfterViewInit() {
    /** WaitMe for file upload **/
    //TODO
    $('#file_loader').waitMe({
      effect: 'bounce',
      text: '',
      bg: 'rgba(255,255,255,0.7)',
      color: '#000',
      maxSize: '',
      textPos: 'vertical',
      fontSize: '',
      source: ''
    });
  }

  getFullDocumentLink = (subElement: MonthlyRatingSubElement): string => {
    return `${ROOT_API_URL}${subElement.document}`
  };

  getDocumentName = (documentLink: string): string => {
    return decodeURI(documentLink.substring(documentLink.lastIndexOf("/") + 1))
  };

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
    newSubElement.isSaved = false;
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
    subElement.isSaved = false;
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
        if (scalarValue === '-') {
          elementValueObject.value = '0';
          elementValueObject.minusZero = true;
          elementValueObject.is_valid = false;
        } else {
          elementValueObject.minusZero = false;
          let toNum = +scalarValue.replace(',', '.');
          if (toNum < -100 || toNum > 100) {
            elementValueObject.is_valid = false;
          } else {
            elementValueObject.value = toNum.toString().replace('.', ',');
            elementValueObject.is_valid = true;
          }
        }
      } else {
        elementValueObject.minusZero = false;
        elementValueObject.is_valid = false;
      }
    } else {
      if (scalarValue === '') {
        scalarValue = null
      }
      elementValueObject.minusZero = false;
      elementValueObject.value = scalarValue;
      elementValueObject.is_valid = true;
    }
    if (elementValueObject.is_valid) {
      subElement.updateCalculatedFields();
    }
    subElement.isSaved = false;
  };

  readFileToBase64 = (subElement: MonthlyRatingSubElement, $event): void => {
    let file: File = $event.target.files[0];
    let myReader: FileReader = new FileReader();
    this.isFileUploading = true;
    subElement.isDocumentSaved = false;
    myReader.onloadend = (_) => {
      subElement.document = myReader.result;
      subElement.documentFileName = $event.target.files[0].name;
      this.isFileUploading = false;
    };
    myReader.readAsDataURL(file);
    subElement.isSaved = false;
  };

  removeSubElementDocument = (subElement: MonthlyRatingSubElement) => {
    let subElementId = subElement.id ? subElement.id : subElement.tempId;
    let input = document.getElementById(`${subElementId}-file`) as any;
    if (input) {
      input.value = '';
    }
    subElement.documentFileName = null;
    this.changeElementProperty(subElement, 'document', null);
  };

  validateSubElement = (subElement): string[] => {
    let validationErrors = [];
    if (!subElement.name) {
      validationErrors.push('Название компонента является обязательным параметром')
    }
    for (let value in subElement.values) {
      if (subElement.values.hasOwnProperty(value)) {
        if (!subElement.values[value].is_valid) {
          validationErrors.push(
            'Значение компонента для района не может быть нечисловым, ' +
            'либо быть менее -100 или более 100'
          )
        }
      }
    }
    return validationErrors
  };

  saveAllChanges = (): void => {
    let validationErrorsText = '';
    for (let subElement of this.loadedRatingElement.related_sub_elements) {
      if (!subElement.isSaved) {
        let subElementValidationErrors = this.validateSubElement(subElement);
        if (subElementValidationErrors.length > 0) {
          for (let error of subElementValidationErrors) {
            validationErrorsText += `<li>${error}</li>`
          }
        } else {
          //preparing data
          let data = {};
          data['name'] = subElement.name;
          // TODO
          data['date'] = null;
          data['responsible'] = subElement.responsible.id;
          data['display_type'] = subElement.display_type;
          data['best_type'] = subElement.best_type;
          data['description'] = subElement.description ? subElement.description : null;
          if (subElement.documentFileName) {
            data['document'] = {
              file_name: subElement.documentFileName,
              data: subElement.document
            }
          } else if (subElement.document === null) {
            data['document'] = null
          }
          data['values'] = [];
          for (let value in subElement.values) {
            if (subElement.values.hasOwnProperty(value)) {
              let scalarValue;
              if (subElement.values[value].is_average) {
                scalarValue = null
              } else {
                if (subElement.display_type === 1) {
                  if (subElement.values[value]._value !== null && subElement.values[value]._value !== undefined) {
                    scalarValue = subElement.values[value]._value
                  } else {
                    scalarValue = null
                  }
                } else if (subElement.display_type === 2) {
                  if (subElement.values[value]._value !== null && subElement.values[value]._value !== undefined) {
                    scalarValue = subElement.values[value]._value / 100
                  } else {
                    scalarValue = null
                  }
                }
              }
              let preparedValue = {
                'region': value,
                'is_average': !!subElement.values[value].is_average,
                'value': scalarValue,
              };
              if (subElement.values[value].id) {
                preparedValue['id'] = subElement.values[value].id
              }
              data['values'].push(preparedValue)
            }
          }
          /** creating new subElement **/
          if (subElement.tempId) {
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
                  newSubElement.isSaved = true;
                  newSubElement.isDocumentSaved = true;
                  this.notificateSuccess()
                },
                error => {
                  console.log(error);
                }
              );
            /** updating existent subElement **/
          } else if (subElement.id && !subElement.isSaved) {
            let url = `${this._elementSaveUrl}${subElement.id}/`;
            this.reqS.http.patch(
              url,
              data,
              this.reqS.options
            )
              .map(this.reqS.extractData)
              .catch(this.reqS.handleError)
              .subscribe(
                data => {
                  console.log(data.document);
                  subElement.document = data.document;
                  subElement.isDocumentSaved = true;
                  subElement.isSaved = true;
                  this.notificateSuccess()
                },
                error => {
                  console.log(error);
                }
              )
          }
        }
      }
    }
    if (validationErrorsText !== '') {
      this.notiS.notificate(new SimpleTextNotification(
        NotificationTypeEnum.WARNING,
        'Ошибка!',
        'Не все изменения удалось сохранить.<br>' +
        'Проверьте правильность введенных данных и попробуйте снова.<br><br>' +
        'Список ошибок:<br>' +
        `<ul>${validationErrorsText}</ul>`
      ))
    }
  };

  notificateSuccess = () => {
    let allSaved = true;
    for (let subElement of this.loadedRatingElement.related_sub_elements) {
      if (!subElement.isSaved) {
        allSaved = false
      }
    }
    if (allSaved) {
      this.notiS.notificate(new SimpleTextNotification(
        NotificationTypeEnum.SUCCESS,
        'Успешно!',
        '<p class="text-center">Все внесенные изменения сохранены.</p>'
      ))
    }
  };

  setValueIsAverage = (subElement: MonthlyRatingSubElement,
                       value: MonthlyRatingSubElementValue,
                       isAverage: boolean): void => {
    value.is_average = isAverage;
    subElement.updateCalculatedFields();
    subElement.isSaved = false;
  };

}
