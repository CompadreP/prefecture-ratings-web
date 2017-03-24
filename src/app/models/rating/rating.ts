/**
 * Created by evgeniy on 2017-03-12.
 */
import {RatingsUser} from "../auth";
import {number} from "ng2-validation/dist/number";
import {getColor} from "../../common/functions";

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

  constructor(obj) {
    this.id = obj.id;
    this.number = obj.number;
    this.base_document = new BaseDocument(obj.base_document);
    this.name = obj.name;
    this.base_description = obj.base_description;
    this.weight = obj.weight;
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
  id: number;
  is_average: boolean;
  _value: number;
  is_valid: boolean;
  color: string;

  constructor(id: number = null, is_average: boolean = null, value: number = null, is_valid: boolean = true) {
    this.id = id;
    this.is_average = is_average;
    this._value = value ? Number(value) : null;
    this.is_valid = is_valid;
  }

  get value() {
    return this._value ? this._value.toString().replace('.', ',') : null
  }

  set value(val) {
    this._value = val ? Number(val.replace(',', '.')) : null;
  }

}

export class MonthlyRatingSubElement {
  id?: number;
  tempId: string;
  isUnsaved: boolean;
  name?: string; // max 1000 symbols
  date?: string; // OPTIONAL YYYY-MM-DD
  responsible?: RatingsUser;
  values?;
  best_type?: number; // 1 - "min", 2 - "max"
  display_type: number; // 1 - decimal, 2 - percent
  description?: string;
  document?: string; // URL to file download
  documentFileName: string;
  isDocumentSaved: boolean;

  _best: number;
  _min: number;
  _max: number;
  _avg: number;

  get best() {
    return this._best ? this._best.toString().replace('.', ',') : null
  }

  get min() {
    return this._min ? this._min.toString().replace('.', ',') : null
  }

  get max() {
    return this._max ? this._max.toString().replace('.', ',') : null
  }

  get avg() {
    return this._avg ? this._avg.toString().replace('.', ',') : null
  }

  constructor(obj?) {
    this.values = {};
    if (obj) {
      this.id = obj.id;
      this.name = obj.name;
      this.date = obj.date;
      this.responsible = new RatingsUser(obj.responsible);
      for (let value in obj.values) {
        if (obj.values.hasOwnProperty(value)) {
          this.values[obj.values[value]['region']] =
            new MonthlyRatingSubElementValue(
              obj.values[value]['id'],
              obj.values[value]['is_average'],
              obj.values[value]['value']
            );
        }
      }
      this.best_type = obj.best_type;
      this.display_type = obj.display_type;
      this.description = obj.description;
      this.document = obj.document;
      if (this.document) {
        this.isDocumentSaved = true;
      }
      this.isUnsaved = obj.isUnsaved;
    }
  }

  updateBestValue = () => {
    let best = null;
    if (this.best_type === 1) {
      best = this._min
    } else if (this.best_type === 2) {
      best = this._max
    }
    this._best = best;
  };

  getMinValue = () => {
    let min = null;
    for (let value in this.values) {
      if (this.values.hasOwnProperty(value)) {
        if (min) {
          if (this.values[value]._value && !this.values[value].is_average && this.values[value]._value < min) {
            min = this.values[value]._value
          }
        } else if (this.values[value]._value && !this.values[value].is_average) {
          min = this.values[value]._value
        }
      }
    }
    return min
  };

  updateMinValue = () => {
    this._min = this.getMinValue()
  };

  getMaxValue = () => {
    let max = null;
    for (let value in this.values) {
      if (this.values.hasOwnProperty(value)) {
        if (max) {
          if (this.values[value]._value && !this.values[value].is_average && this.values[value]._value > max) {
            max = this.values[value]._value
          }
        } else if (this.values[value]._value && !this.values[value].is_average) {
          max = this.values[value]._value
        }
      }
    }
    return max
  };

  updateMaxValue = () => {
    this._max = this.getMaxValue()
  };

  getAverageValue = () => {
    let avg = null;
    let sum = null;
    let cnt = 0;
    for (let value in this.values) {
      if (this.values.hasOwnProperty(value)) {
        if (this.values[value]._value && !this.values[value].is_average) {
          sum += this.values[value]._value;
          cnt++;
        }
      }
    }
    if (sum !== null && (cnt > 0)) {
      avg = sum / cnt
    }
    if (typeof avg === 'number') {
      avg = avg.toFixed(2).toString().replace('.', ',');
    }
    return avg;
  };

  updateAverageValues = () => {
    this._avg = this.getAverageValue();
    for (let value in this.values) {
      if (this.values.hasOwnProperty(value)) {
        if (this.values[value].is_average) {
          this.values[value].value = this._avg;
        }
      }
    }
  };

  setColors = () => {
    for (let value in this.values) {
      if (this.values.hasOwnProperty(value)) {
        this.values[value].color = getColor(this.values[value].value, this._min, this._max, this.best_type)
      }
    }
  };

  updateCalculatedFields = () => {
    this.updateMinValue();
    this.updateMaxValue();
    this.updateBestValue();
    this.updateAverageValues();
    this.setColors();
  };

}


export class MonthlyRatingElement {
  id: number;
  monthly_rating: MonthlyRatingShort;
  rating_element: RatingElement;
  responsible: RatingsUser;
  additional_description: string;
  negotiator_comment: string;
  region_comment: string;
  related_sub_elements?: MonthlyRatingSubElement[];
  values;

  constructor(obj) {
    this.id = obj.id;
    this.monthly_rating = new MonthlyRatingShort(obj.monthly_rating);
    this.rating_element = new RatingElement(obj.rating_element);
    this.responsible = new RatingsUser(obj.responsible);
    this.additional_description = obj.additional_description;
    this.negotiator_comment = obj.negotiator_comment;
    this.region_comment = obj.region_comment;
    this.related_sub_elements = [];
    if (obj.related_sub_elements) {
      for (let subElement of obj.related_sub_elements) {
        subElement.isUnsaved = false;
        this.related_sub_elements.push(new MonthlyRatingSubElement(subElement))
      }
    }
    this.values = {};
    if (obj.values) {
      for (let value of obj.values) {
        let new_value = new MonthlyRatingElementValue(value);
        this.values[new_value.region_id] = new_value.value
      }
    }
  }

  getAverage = () => {
    let sum = 0;
    let count = 0;
    for (let region in this.values) {
      if (this.values.hasOwnProperty(region)) {
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
    if (obj) {
      this.base_document = new BaseDocument(obj.base_document);
      this.approved_by = new RatingsUser(obj.approved_by);
      if (obj.elements) {
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
