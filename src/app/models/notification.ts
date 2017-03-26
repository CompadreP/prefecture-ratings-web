/**
 * Created by evgeniy on 2017-03-12.
 */

export const enum NotificationTypeEnum {
  INFO = 1,
  SUCCESS = 2,
  WARNING = 3,
  FAIL = 4,
}

export class Notification {
  type: NotificationTypeEnum;
  header: string;
  body: string;
  closeSymbol: boolean;
  okButton: boolean;
  okButtonText: string;
  cancelButton: boolean;
  cancelButtonText: string;
  isStatic: boolean;

  constructor(type: NotificationTypeEnum, header: string, body: string,
              closeSymbol: boolean = true, okButton: boolean = true,
              okButtonText: string = 'OK', cancelButton: boolean = false,
              cancelButtonText: string = 'Отмена') {
    this.type = type;
    this.header = header;
    this.body = body;
    this.closeSymbol = closeSymbol;
    this.okButton = okButton;
    this.okButtonText = okButtonText;
    this.cancelButton = cancelButton;
    this.cancelButtonText = cancelButtonText;
  }
}

export class SimpleTextNotification extends Notification {
  constructor(type: NotificationTypeEnum, header: string, body: string) {
    super(
      type,
      header,
      body,
      true,
      false,
      undefined,
      false)
  }
}

export class AreYouSureNotification extends Notification {
  constructor(header: string, body: string) {
    super(
      NotificationTypeEnum.WARNING,
      header,
      body,
      false,
      true,
      undefined,
      true)
  }
}

export class AreYouSureSimpleNotification extends AreYouSureNotification {
  constructor() {
    super(
        'Внимание!',
        '<p>Вы собираетесь совершить действие, которое будет невозможно отменить.<p>' +
        '<p class="text-center">Вы уверены?</p>',
    )
  }
}

  //     if (!this._subscriptions['notificationOkSubscription']) {
  //       this._subscriptions['notificationOkSubscription'] = this.notiS.notificationOk$.subscribe(
  //         () => {
  //           this.reqS.http.patch(
  //             `${this._elementSaveUrl}${subElement.id}/`,
  //             {'document': null},
  //             this.reqS.options
  //           )
  //             .map(this.reqS.extractData)
  //             .catch(this.reqS.handleError)
  //             .subscribe(
  //               _ => {
  //                 subElement.document = null;
  //               },
  //               error => {
  //                 console.log(error);
  //               }
  //             );
  //           this.notiS.hideModalAndUnsubscribe(this._subscriptions, this.notificationSubscriptionKeys);
  //         }
  //       );
  //     }
  //     if (!this._subscriptions['notificationCancelSubscription']) {
  //       this._subscriptions['notificationCancelSubscription'] = this.notiS.notificationCancel$.subscribe(
  //         () => {
  //           this.notiS.hideModalAndUnsubscribe(this._subscriptions, this.notificationSubscriptionKeys);
  //         }
  //       );
  //     }
