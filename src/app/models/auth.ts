import {Organization} from "./map";
/**
 * Created by evgeniy on 05.03.2017.
 */


class User {
  email: string;
  is_active: boolean;

  // constructor(email: string, is_active: boolean) {
  //   this.email = email;
  //   this.is_active = is_active;
  // }
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
}
