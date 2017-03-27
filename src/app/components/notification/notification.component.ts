import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {NotificationService} from "./notification.service";
import {Notification, NotificationTypeEnum} from "./notification.models";

@Component({
  selector: 'notification-modal',
  templateUrl: 'notification.component.html',
  styleUrls: ['notification.component.sass']
})
export class NotificationModalComponent implements OnInit, OnDestroy {
  @ViewChild('notificationModal')
  notificationModal;

  notification: Notification;

  constructor(private notiS: NotificationService) {
    notiS.notification$.subscribe(
      notification => {
        this.notification = notification;
        if ([NotificationTypeEnum.SUCCESS, NotificationTypeEnum.FAIL].indexOf(this.notification.type) === -1) {
          this.notificationModal.config = {backdrop: 'static'}
        } else {
          this.notificationModal.config = {}
        }
        this.notificationModal.show();
      });
    notiS.hideModal$.subscribe(
      _ => {
        this.notificationModal.hide()
      }
    )
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  okButtonAction = () => {
    this.notiS.notificateOk();
    this.notiS.notificateResult(true);
  };

  cancelButtonAction = () => {
    this.notiS.notificateCancel();
    this.notiS.notificateResult(false);
  };

}
