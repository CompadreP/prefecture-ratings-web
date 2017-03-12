import {Organization} from "./map";
/**
 * Created by evgeniy on 05.03.2017.
 */


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

  constructor(Object) {
    this.id = Object.id;
    this.role = Object.role;
    this.user = Object.user;
    this.first_name = Object.first_name;
    this.last_name = Object.last_name;
    this.patronymic = Object.patronymic;
    this.organization = Object.organization;
  }

  displayName() {
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
    if (this.organization && this.organization.name) {
      name += ' | ' + this.organization.name
    }
    return name
  }
}
