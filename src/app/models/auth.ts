/**
 * Created by evgeniy on 05.03.2017.
 */
import {Organization} from "./map";


class User {
  email: string;
  is_active: boolean;
}

export class RatingsUser {
  id?: number;
  role: string;
  user: User;
  first_name?: string;
  last_name?: string;
  patronymic?: string;
  organization?: Organization;
  can_approve_rating?: boolean = false;
  displayName: string;
  fullDisplayName: string;

  constructor(obj) {
    if (obj !== null) {
      this.id = obj.id;
      this.role = obj.role;
      this.user = obj.user;
      this.first_name = obj.first_name;
      this.last_name = obj.last_name;
      this.patronymic = obj.patronymic;
      this.organization = obj.organization;
      if (obj.can_approve_rating) {
        this.can_approve_rating = obj.can_approve_rating;
      }
      this.displayName = this._displayName();
      this.fullDisplayName = this._fullDisplayName();
    }
  }

  _fullDisplayName(): string {
    let name = this.displayName;
    if (this.organization && this.organization.name) {
      name += ' | ' + this.organization.name
    }
    return name
  };

  _displayName(): string {
    let name = '';
    if (this.last_name) {
      name += this.last_name
    }
    if (this.first_name) {
      name += ' ' + this.first_name.charAt(0) + '.'
    }
    if (this.patronymic) {
      name += this.patronymic.charAt(0) + '.'
    }
    return name
  }
}
