import {Component, Input, Output, EventEmitter} from '@angular/core';
import {RatingsUser} from "../../models/auth";
import {AuthenticationService} from "../../services/authentication.service";



@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass'],
})
export class NavbarComponent {
  @Input()user: RatingsUser;
  isCollapsed: boolean = true;

  constructor(private authenticationService: AuthenticationService) {

  }

  showLoginModal() {
    this.authenticationService.loginRequest$.emit();
  }

  logout(): void {
    this.authenticationService.logout();
  }

}
