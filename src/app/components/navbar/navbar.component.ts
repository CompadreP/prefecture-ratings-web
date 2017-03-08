import {Component, ViewChild, Input} from '@angular/core';
import {LoginModalComponent} from "../authentication/login-modal.component";
import {RatingsUser} from "../../models/auth";
import {AuthenticationService} from "../../services/authentication.service";

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass'],
})
export class NavbarComponent {
  @Input()
  user: RatingsUser;
  @ViewChild(LoginModalComponent) loginModal;

  constructor(private authenticationService: AuthenticationService) {

  }

  public logout(): void {
    this.authenticationService.logout();
  }

  public isCollapsed: boolean = true;

  public showLoginModal(): void {
    this.loginModal.showLoginModal()
  }
}
