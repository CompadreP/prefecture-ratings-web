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

  constructor(obj) {
    if (obj !== null) {
      this.id = obj.id;
      this.role = obj.role;
      this.user = obj.user;
      this.first_name = obj.first_name;
      this.last_name = obj.last_name;
      this.patronymic = obj.patronymic;
      this.organization = obj.organization;
    }
  }

  displayName = () => {
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
