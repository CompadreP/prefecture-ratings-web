import {Component, OnInit, ViewChild} from '@angular/core';
import {NotificationService} from "../../services/notification.service";
import {Notification} from "../../models/notification";

@Component({
  selector: 'notification-modal',
  templateUrl: 'notification-modal.component.html',
  styleUrls: ['notification-modal.component.sass']
})
export class NotificationModalComponent implements OnInit {
  @ViewChild('notificationModal')
  notificationModal;

  notification: Notification;

  constructor(private notificationService: NotificationService) {
    notificationService.notification$.subscribe(
      notification => {
        this.notification = notification;
        this.notificationModal.show();
      });
  }

  ngOnInit() {
  }

}
