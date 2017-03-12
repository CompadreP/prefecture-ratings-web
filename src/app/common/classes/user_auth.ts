/**
 * Created by evgeniy on 2017-03-05.
 */

import {Injectable} from "@angular/core";
import {AuthenticationService} from "../../services/authentication.service";
import {RatingsUser} from "../../models/auth";

@Injectable()
export class UserAuth {
  public user: RatingsUser = null;

  constructor(public auth: AuthenticationService) {
    auth.user$.subscribe(user => this.user = user);
  }

}
