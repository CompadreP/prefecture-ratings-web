import {RatingsUser} from "../auth";
/**
 * Created by evgeniy on 2017-03-12.
 */

class BaseDocument {
  description_imp: string
}

export class MonthlyRating {
  id: number;
  base_document: BaseDocument;
  is_negotiated: boolean;
  is_approved: boolean;
  approved_by: RatingsUser;
  year: number;
  month: number;

  constructor(obj) {
    this.id = obj.id;
    this.base_document = obj.base_document;
    this.is_negotiated = obj.is_negotiated;
    this.is_approved = obj.is_approved;
    this.approved_by = obj.approved_by;
    this.year = obj.year;
    this.month = obj.month;
  }
}

export class AvailableRating {
  id: number;
  year: number;
  month: number;
  is_negotiated: boolean;
  is_approved: boolean;

  constructor(obj) {
    this.id = obj.id;
    this.year = obj.year;
    this.month = obj.month;
    this.is_negotiated = obj.is_negotiated;
    this.is_approved = obj.is_approved;
  }

  static getYearsMonthsList(availableRatings: AvailableRating[]){
    let availableYearsMonths = new Map();
    for (let rating of availableRatings) {
      if (!(rating.year in availableYearsMonths)) {
        availableYearsMonths[rating.year] = [rating.month]
      } else {
        if (!(availableYearsMonths[rating.year].indexOf(rating.month) > -1)) {
          availableYearsMonths[rating.year].push(rating.month)
        }
      }
    }
    return availableYearsMonths
  }

  static getIdByYearAndMonth(year: number, month: number, availableRatings: AvailableRating[]){
    for (let rating of availableRatings) {
      if (rating.year === year && rating.month === month) {
        return rating.id
      }
    }
    return 0
  }
}
