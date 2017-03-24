/**
 * Created by evgeniy on 2017-03-19.
 */
import {Injectable} from "@angular/core";

import {RequestsService} from "./requests.service";
import {ROOT_API_URL} from "../../settings";
import {RatingsUser} from "../models/auth";

@Injectable()
export class PrefectureEmployeesService {
  private apiUrl: string = `${ROOT_API_URL}/api/employees/prefecture_employees/`;

  employees: RatingsUser[];

  constructor(private reqS: RequestsService) {
    this.employees = [];
  }

  loadEmployees = () => {
    this.reqS.http.get(
      this.apiUrl,
      this.reqS.options
    )
      .map(this.reqS.extractData)
      .catch(this.reqS.handleError)
      .subscribe(
        employees => {
          for (let employee in employees) {
            if (employees.hasOwnProperty(employee)) {
              this.employees.push(new RatingsUser(employees[employee]))
            }
          }
        },
        error => {
          console.log(error);
        }
      )
  };

  getEmployeeById = (id) => {
    if (this.employees && this.employees.length > 0) {
      for (let employee of this.employees) {
        if (employee.id === +id) {
          return employee
        }
      }
    }
    return null;
  }
}
