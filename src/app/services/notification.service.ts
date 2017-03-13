/**
 * Created by evgeniy on 2017-03-12.
 */

import {Injectable, EventEmitter} from '@angular/core';
import {Notification} from "../models/notification";

@Injectable()
export class NotificationService {
  public notification$;

  constructor() {
    this.notification$ = new EventEmitter();
  }

  notificate = (notification: Notification) => {
    this.notification$.emit(notification)
  }

}
