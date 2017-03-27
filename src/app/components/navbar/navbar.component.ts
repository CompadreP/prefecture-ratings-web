import {Component} from '@angular/core';
import {AuthenticationService} from "../authentication/authentication.service";


@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass'],
})
export class NavbarComponent {
  isCollapsed: boolean = true;

  constructor(public authS: AuthenticationService) {

  }

  showLoginModal = () => {
    this.authS.loginRequest$.emit();
  };

  logout = (): void => {
    this.authS.logout();
  };

}
