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
  type: NotificationTypeEnum = null;
  header: string = null;
  body: string = null;
  closeSymbol: boolean = null;
  okButton: boolean = null;
  okButtonText: string = null;
  cancelButton: boolean = null;
  cancelButtonText: string = null;

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
        'Вы собираетесь совершить действие, которое будет невозможно отменить. ' +
        'Вы уверены?',
    )
  }
}
