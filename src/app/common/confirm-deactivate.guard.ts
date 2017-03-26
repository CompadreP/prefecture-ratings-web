/**
 * Created by evgeniy on 2017-03-25.
 */

import {Injectable}    from '@angular/core';
import {CanDeactivate} from '@angular/router';
import {Observable}    from 'rxjs/Observable';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
  // canDeactivate: () => any;
}

@Injectable()
export class ConfirmDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {

  canDeactivate(component: CanComponentDeactivate) {
    return component.canDeactivate ? component.canDeactivate() : true;
  }

}
