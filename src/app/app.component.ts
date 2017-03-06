import {Component} from '@angular/core';
import {AuthenticationService} from "./services/authentication.service";
import {RatingsUser} from "./models/auth";
import {XSRFStrategy, CookieXSRFStrategy} from "@angular/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  providers: [        {
            provide: XSRFStrategy,
            useValue: new CookieXSRFStrategy('csrftoken', 'X-CSRFToken')
        }, AuthenticationService]
})
export class AppComponent {
  title = 'Ratings!!!';
  currentUser: RatingsUser = null;

  constructor(private authenticationService: AuthenticationService) {
    authenticationService.userLoggedIn$.subscribe(
      user => {
        this.currentUser = new RatingsUser(user)

      }
    );
    authenticationService.userLoggedOut$.subscribe(
      user => {
        this.currentUser = null
      }
    );
  }
}
