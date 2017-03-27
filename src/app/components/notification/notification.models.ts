/**
 * Created by evgeniy on 2017-03-12.
 */

import {RatingsError} from "../../common/models/error";
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

export class ErrorNotification extends SimpleTextNotification {
  constructor(error: RatingsError) {
    if (error instanceof RatingsError) {
      super(
        NotificationTypeEnum.FAIL,
        'Ошибка!',
        error.translatedTextAsList()
      )
    } else {
      super(
        NotificationTypeEnum.FAIL,
        'Ошибка!',
        '<p>К сожалению в данный момент сервер недоступен, попробуйте зайти позже.</p>'
      )
    }
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

export class UnsavedChangesNotification extends AreYouSureNotification {
  constructor() {
    super(
      'Внимание!',
      '<p>На этой странице имеются несохраненные изменения.<p>' +
      '<p class="text-center">Вы уверены?</p>',
    )
  }
}
