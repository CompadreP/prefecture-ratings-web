/**
 * Created by evgeniy on 2017-03-12.
 */

import {Injectable, EventEmitter} from '@angular/core';
import {Notification} from "../models/notification";

@Injectable()
export class NotificationService {
  public notification$;
  public notificationOk$;
  public notificationCancel$;
  public hideModal$;

  constructor() {
    this.notification$ = new EventEmitter();
    this.notificationOk$ = new EventEmitter();
    this.notificationCancel$ = new EventEmitter();
    this.hideModal$ = new EventEmitter();
  }

  notificate = (notification: Notification) => {
    this.notification$.emit(notification)
  };

  notificateOk = () => {
    this.notificationOk$.emit()
  };

  notificateCancel = () => {
    this.notificationCancel$.emit()
  };

  hideModal = () => {
    this.hideModal$.emit()
  }

}
