import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {NotificationService} from "../../services/notification.service";
import {Notification} from "../../models/notification";

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
    this.notiS.notificateOk()
  };

  cancelButtonAction = () => {
    this.notiS.notificateCancel()
  };

}
