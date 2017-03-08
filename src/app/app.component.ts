import {Component, OnInit} from '@angular/core';

import {AuthenticationService} from "./services/authentication.service";
import {UserAuth} from "./common/classes/user_auth";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  providers: [AuthenticationService]
})
export class AppComponent implements OnInit {
  title = 'Ratings!!!';
  auth: UserAuth;


  constructor(private authenticationService: AuthenticationService) {
    this.auth = new UserAuth(authenticationService);
  }

  ngOnInit() {
    this.authenticationService.checkExistingAuth();
  }

}
