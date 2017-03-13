/**
 * Created by evgeniy on 2017-03-12.
 */
import {RatingsUser} from "../auth";

class BaseDocument {
  description_imp: string;

  constructor(obj) {
    this.description_imp = obj.description_imp;
  }
}

class RatingElement {
  id: number;
  number: number;
  base_document: BaseDocument;
  name: string;
  base_description: string;
  weight: number;
  sub_elements_display_type: number;

  constructor(obj) {
    this.id = obj.id;
    this.number = obj.number;
    this.base_document = new BaseDocument(obj.base_document);
    this.name = obj.name;
    this.base_description = obj.base_description;
    this.weight = obj.weight;
    this.sub_elements_display_type = obj.sub_elements_display_type;
  }
}

class MonthlyRatingElementValue {
  region_id: number;
  value: number;

  constructor(obj) {
    this.region_id = obj.region_id;
    this.value = obj.value;
  }

}

class MonthlyRatingElement {
  id: number;
  rating_element: RatingElement;
  responsible: RatingsUser;
  additional_description: string;
  negotiator_comment: string;
  region_comment: string;
  values: {} = {};

  constructor(obj) {
    this.id = obj.id;
    this.rating_element = new RatingElement(obj.rating_element);
    this.responsible = new RatingsUser(obj.responsible);
    this.additional_description = obj.additional_description;
    this.negotiator_comment = obj.negotiator_comment;
    this.region_comment = obj.region_comment;
    for (let value of obj.values) {
      let new_value = new MonthlyRatingElementValue(value);
      this.values[new_value.region_id] = new_value.value
    }
  }

  getAverage = () => {
    let sum = 0;
    let count = 0;
    for (let region in this.values) {
      sum += this.values[region];
      count++;
    }
    return (sum / count).toFixed(1)
  }
}

export class MonthlyRating {
  id: number;
  year: number;
  month: number;
  base_document: BaseDocument;
  is_negotiated: boolean;
  is_approved: boolean;
  approved_by: RatingsUser;
  elements: MonthlyRatingElement[] = [];

  constructor(obj) {
    this.id = obj.id;
    this.base_document = new BaseDocument(obj.base_document);
    this.is_negotiated = obj.is_negotiated;
    this.is_approved = obj.is_approved;
    this.approved_by = new RatingsUser(obj.approved_by);
    this.year = obj.year;
    this.month = obj.month;
    for (let element of obj.elements) {
      let new_elements = [];
      new_elements[element.rating_element.number] = new MonthlyRatingElement(element);
      this.elements = new_elements.filter(_ => _)
    }
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

  static getYearsAndMonthsList = (availableRatings: AvailableRating[]) => {
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
  };

  static getIdByYearAndMonth = (year: number, month: number, availableRatings: AvailableRating[]) => {
    for (let rating of availableRatings) {
      if (rating.year === year && rating.month === month) {
        return rating.id
      }
    }
    return 0
  }
}
