import {
  Component, OnInit, ViewChild, AfterViewInit,
  HostListener, Renderer, NgZone
} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import 'rxjs/add/operator/switchMap';

import {ContextMenuComponent} from 'angular2-contextmenu';

import {generateGuid, getShortString} from "../../../common/functions";
import {RatingElementsService} from "./rating-element.service";
import {RequestsService} from "../../../common/services/requests.service";
import {
  MonthlyRatingElement,
  MonthlyRatingSubElement,
  MonthlyRatingSubElementValue
} from "../rating.models";
import {PrefectureEmployeesService} from "../../../common/services/employees.service";
import {AuthenticationService} from "../../authentication/authentication.service";
import {BaseTableComponent} from "../base-table.component";
import {RegionsService} from "../../../common/services/regions.service";
import {ROOT_API_URL} from "../../../../settings";
import {NotificationService} from "../../notification/notification.service";
import {
  AreYouSureSimpleNotification,
  SimpleTextNotification, NotificationTypeEnum, UnsavedChangesNotification
} from "../../notification/notification.models";
import {CanComponentDeactivate} from "../../../common/confirm-deactivate.guard";
import {AvailableRatingsService} from "../available-ratings.service";

declare let $: any;


@Component({
  selector: 'rating-element',
  templateUrl: './rating-element.component.html',
  styleUrls: ['./rating-element.component.sass']
})
export class RatingElementComponent extends BaseTableComponent implements OnInit, AfterViewInit, CanComponentDeactivate {
  _elementSaveUrl = `${ROOT_API_URL}/api/ratings/monthly/sub_elements/`;
  _localStorageHeadersKey = 'ratingElementsHeadersDisplay';
  userCanChangeElement: boolean;
  userCanChangeOneOfSubelements: boolean;
  isFileUploading: boolean;
  saveAllPending: boolean = false;
  getShortString = getShortString;

  @ViewChild('valueMenu') valueMenu: ContextMenuComponent;

  colNums = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

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
              private availratS: AvailableRatingsService,
              private ngZone: NgZone,
              public  notiS: NotificationService,
              public reqS: RequestsService,
              public regionsS: RegionsService,
              public authS: AuthenticationService,
              public prefempS: PrefectureEmployeesService,
              public renderer: Renderer,) {
    super(regionsS, reqS, notiS, renderer);
  }

  ngOnInit() {
    this.isFileUploading = false;
    this.route.params
      .switchMap((params: Params) => this.ratingelS.loadRatingElement(+params['id'], true))
      .catch(this.reqS.handleError)
      .map(this.reqS.extractData)
      .subscribe(
        data => {
          //console.log(data);
          this.loadedRatingElement = new MonthlyRatingElement(data);
          //console.log(this.loadedRatingElement);
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
            if (this.isLocalStorageHeadersValid()) {
              this.headers = JSON.parse(localStorage.getItem(this._localStorageHeadersKey))
            }
          }
          this.loadedRatingElement.isSaved = true;
          this.loadedRatingElement.updateCalculatedFields();
          this.ngZone.onStable.first().subscribe(() => {
            setTimeout(() => {
              this.setElementsSizes();
            }, 0)
          });
        },
        error => {
          this.notiS.notificateError(error);
          console.log(error);
        }
      );
  }

  canDeactivate() {
    if (this.checkIfUnsaved()) {
      this.notiS.notificate(new UnsavedChangesNotification());
      if (!this._subscriptions['notificationResultSubscription']) {
        this._subscriptions['notificationResultSubscription'] = this.notiS.result$.subscribe(
          () => {
            this.notiS.hideModalAndUnsubscribe(this._subscriptions, ['notificationResultSubscription']);
          }
        )
      }
      return this.notiS.result$;
    } else {
      return true
    }
  }

  private checkIfUnsaved = () => {
    for (let subElement of this.loadedRatingElement.related_sub_elements) {
      if (!subElement.isSaved) {
        return true
      }
    }
    return false
  };

  private checkIfUserCanChangeElement = (): boolean => {
    let result = !!this.authS.user
      && (this.authS.user.id === this.loadedRatingElement.responsible.id)
      && !this.loadedRatingElement.monthly_rating.is_approved
    // console.log(!!this.authS.user)
    // console.log(this.authS.user.id === this.loadedRatingElement.responsible.id)
    // console.log(!this.loadedRatingElement.monthly_rating.is_approved)
    // console.log(result, this.authS.user.role)
    return result
  };

  private invalidateElementCalculatedValues = (): void => {
    this.loadedRatingElement.setValuesColorsToInvalid()
  };

  private validateSubElement = (subElement): string[] => {
    let validationErrors = [];
    if (!subElement.name) {
      validationErrors.push('Название компонента является обязательным параметром')
    }
    for (let value in subElement.values) {
      if (subElement.values.hasOwnProperty(value)) {
        if (!subElement.values[value].is_valid) {
          validationErrors.push(
            'Значение компонента для района не может быть нечисловым, ' +
            'либо быть менее -1000 или более 1000'
          )
        }
      }
    }
    return validationErrors
  };

  private checkIfAllSaved = () => {
    let allSaved = true;
    for (let subElement of this.loadedRatingElement.related_sub_elements) {
      if (!subElement.isSaved) {
        allSaved = false
      }
    }
    return allSaved
  };

  private proceedSuccessSaveAll = (): void => {
    this.ratingelS.loadRatingElementValues(this.loadedRatingElement.id)
      .map(this.reqS.extractData)
      .catch(this.reqS.handleError)
      .subscribe(
        data => {
          this.loadedRatingElement.setValues(
            {values: data}
          );
          this.loadedRatingElement.setValuesColors();
          this.notificateSuccessSaveAll()
        },
        error => {
          this.notiS.notificateError(error);
          console.log(error)
        })

  };

  private notificateSuccessSaveAll = (): void => {
    this.notiS.notificate(new SimpleTextNotification(
      NotificationTypeEnum.SUCCESS,
      'Успешно!',
      '<p class="text-center">Все внесенные изменения сохранены.</p>'
    ))
  };

  @HostListener('window:beforeunload', ['$event'])
  public beforeUnloadHander(event) {
    if (this.checkIfUnsaved()) {
      let dialogText = "You have unsaved data changes. Are you sure to close the page?";
      event.returnValue = dialogText;
      return dialogText;
    }
  }

  public getFullDocumentLink = (subElement: MonthlyRatingSubElement): string => {
    if (subElement.document) {
      if (subElement.document.indexOf('http') === 0) {
        return subElement.document
      } else {
        return `${ROOT_API_URL}${subElement.document}`
      }
    } else {
      return null
    }
  };

  public getDocumentName = (documentLink: string): string => {
    if (documentLink) {
      return getShortString(decodeURI(documentLink.substring(documentLink.lastIndexOf("/") + 1)))
    } else {
      return null
    }
  };

  public userCanChangeSubElement = (subElement: MonthlyRatingSubElement): boolean => {
    let result = !!this.authS.user
      && ((this.authS.user.id === subElement.responsible.id)
           || (this.authS.user.id === this.loadedRatingElement.responsible.id))
      && !this.loadedRatingElement.monthly_rating.is_approved;
    //console.log(result)
    return result

  };

  public emitElementChange = (elementId) => {
    //this.pendingSaves[elementId] = true;
    //this._valueChangeWatchers[elementId][property].next([elementId, property, value])
  };

  public addSubElement = (): void => {
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

  public removeSubElement = (subElement: MonthlyRatingSubElement): void => {
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
                  this.proceedSuccessSaveAll();
                  this.loadedRatingElement.related_sub_elements.forEach((item, index) => {
                    if (item.id === subElement.id) {
                      this.loadedRatingElement.related_sub_elements.splice(index, 1);
                      return
                    }
                  })
                },
                error => {
                  this.notiS.notificateError(error);
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

  // changeElementProperty = (element: MonthlyRatingElement,
  //                          property: string,
  //                          value): void => {
  //   element[property] = value;
  //   element.isSaved = false;
  //   if (['best_type'].indexOf(property) > -1) {
  //     element.updateCalculatedFields();
  //   }
  // };

  public changeSubElementProperty = (subElement: MonthlyRatingSubElement,
                              property: string,
                              value): void => {
    subElement[property] = value;
    subElement.isSaved = false;
    if (['best_type'].indexOf(property) > -1) {
      subElement.updateCalculatedFields();
    }
    this.invalidateElementCalculatedValues()
  };

  public changeValueInput = (subElement: MonthlyRatingSubElement,
                      elementValueObject: MonthlyRatingSubElementValue,
                      scalarValue: string): void => {
    if ((scalarValue !== null) && (scalarValue !== '')) {
      let regex = /^(-)?(\d{1,4}(,(\d{1,2})?)?)?$/;
      if (regex.test(scalarValue)) {
        if (scalarValue === '-') {
          elementValueObject.value = '0';
          elementValueObject.minusZero = true;
          elementValueObject.is_valid = false;
        } else {
          elementValueObject.minusZero = false;
          let toNum = +scalarValue.replace(',', '.');
          console.log(toNum);
          if (toNum < -1000 || toNum > 1000) {
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
      this.invalidateElementCalculatedValues()
    }
    subElement.isSaved = false;
  };

  public readFileToBase64 = (subElement: MonthlyRatingSubElement, $event): void => {
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

  public getFileLabel = (subElement) => {
    if (subElement.documentFileName) {
      return subElement.documentFileName
    } else if (subElement.document) {
      return subElement.document
    } else {
      return 'Выберите файл...'
    }
  };

  public removeSubElementDocument = (subElement: MonthlyRatingSubElement) => {
    let subElementId = subElement.id ? subElement.id : subElement.tempId;
    let input = document.getElementById(`${subElementId}-file`) as any;
    if (input) {
      input.value = '';
    }
    subElement.documentFileName = null;
    this.changeSubElementProperty(subElement, 'document', null);
  };

  public saveAllChanges = (): void => {
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
                    scalarValue = (subElement.values[value]._value / 100).toFixed(4)
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
                  if (this.checkIfAllSaved()) {
                    this.saveAllPending = false;
                    this.proceedSuccessSaveAll()
                  }
                },
                error => {
                  this.notiS.notificateError(error);
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
                  subElement.document = data.document;
                  subElement.isDocumentSaved = true;
                  subElement.isSaved = true;
                  if (this.checkIfAllSaved()) {
                    this.saveAllPending = false;
                    this.proceedSuccessSaveAll()
                  }
                },
                error => {
                  this.notiS.notificateError(error);
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

  public setValueIsAverage = (subElement: MonthlyRatingSubElement,
                       value: MonthlyRatingSubElementValue,
                       isAverage: boolean): void => {
    value.is_average = isAverage;
    subElement.updateCalculatedFields();
    subElement.isSaved = false;
  };

}
