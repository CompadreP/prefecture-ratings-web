import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {NotificationService} from "../../services/notification.service";
import {Notification, NotificationTypeEnum} from "../../models/notification";

@Component({
  selector: 'notification-modal',
  templateUrl: 'notification-modal.component.html',
  styleUrls: ['notification-modal.component.sass']
})
export class NotificationModalComponent implements OnInit, OnDestroy {
  @ViewChild('notificationModal')
  notificationModal;

  notification: Notification;

  constructor(private notiS: NotificationService) {
    notiS.notification$.subscribe(
      notification => {
        this.notification = notification;
        if (this.notification.type !== NotificationTypeEnum.SUCCESS) {
          this.notificationModal.config = {backdrop: 'static'}
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
