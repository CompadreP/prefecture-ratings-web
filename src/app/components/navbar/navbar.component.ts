import {Component, ViewChild} from '@angular/core';
import {LoginModalComponent} from "../login-modal/login-modal.component";

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass'],
})
export class NavbarComponent {
  @ViewChild(LoginModalComponent) loginModal;



  public isCollapsed: boolean = true;

  public showLoginModal(): void {
    this.loginModal.showLoginModal()
  }
}
