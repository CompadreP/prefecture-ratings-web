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

export class MonthlyRatingSubElementValue {
  region: number;
  is_average: boolean;
  value: number;

  constructor(obj) {
    this.region = obj.region;
    this.is_average = obj.is_average;
    this.value = obj.value
  }
}

export class MonthlyRatingSubElement {
  id?: number;
  name?: string; // max 1000 symbols
  date?: string; // OPTIONAL YYYY-MM-DD
  responsible?: RatingsUser;
  values?: MonthlyRatingSubElementValue[];
  best_type?: number; // 1 - "min", 2 - "max"
  description?: string;
  document?: string; // URL to file download

  constructor(obj?) {
    this.id = obj.id;
    this.name = obj.name;
    this.date = obj.date;
    this.responsible = new RatingsUser(obj.responsible);
    for (let value of obj.values) {
      this.values.push(new MonthlyRatingSubElementValue(value))
    }
    this.best_type = obj.best_type;
    this.description = obj.description;
    this.document = obj.document;
  }

}


export class MonthlyRatingElement {
  id: number;
  monthly_rating: MonthlyRatingShort;
  rating_element: RatingElement;
  responsible: RatingsUser;
  additional_description: string;
  negotiator_comment: string;
  region_comment: string;
  related_sub_elements?: MonthlyRatingSubElement[] = [];
  values;

  constructor(obj) {
    this.id = obj.id;
    this.monthly_rating = new MonthlyRatingShort(obj.monthly_rating);
    this.rating_element = new RatingElement(obj.rating_element);
    this.responsible = new RatingsUser(obj.responsible);
    this.additional_description = obj.additional_description;
    this.negotiator_comment = obj.negotiator_comment;
    this.region_comment = obj.region_comment;
    if (obj.related_sub_elements) {
      for (let subElement of obj.related_sub_elements) {
        this.related_sub_elements.push(new MonthlyRatingSubElement(subElement))
      }
    }
    this.values = {};
    for (let value of obj.values) {
      let new_value = new MonthlyRatingElementValue(value);
      this.values[new_value.region_id] = new_value.value
    }
  }

  getAverage = () => {
    let sum = 0;
    let count = 0;
    for (let region in this.values) {
      if (this.values.hasOwnProperty(region)){
        sum += this.values[region];
        count++;
      }
    }
    return (sum / count).toFixed(1)
  }
}

export class MonthlyRatingShort {
  id: number;
  year: number;
  month: number;
  is_negotiated: boolean;
  is_approved: boolean;
  state?: string = null;

  constructor(obj) {
    if (obj) {
      this.id = obj.id;
      this.is_negotiated = obj.is_negotiated;
      this.is_approved = obj.is_approved;
      this.year = obj.year;
      this.month = obj.month;
    }
  }
}

export class MonthlyRatingFull extends MonthlyRatingShort {
  base_document?: BaseDocument;
  approved_by?: RatingsUser;
  elements?: MonthlyRatingElement[] = [];

  constructor(obj) {
    super(obj);
    if(obj) {
      this.base_document = new BaseDocument(obj.base_document);
      this.approved_by = new RatingsUser(obj.approved_by);
      if (obj.elements){
        for (let element of obj.elements) {
          let new_elements = [];
          new_elements[element.rating_element.number] = new MonthlyRatingElement(element);
          this.elements = new_elements.filter(_ => _)
        }
      }
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
