/**
 * Created by evgeniy on 2017-03-12.
 */
import {RatingsUser} from "../authentication/authentication.models";
import {getColor} from "../../common/functions";

class BaseDocument {
  description_imp: string;

  constructor(obj) {
    this.description_imp = obj.description_imp;
  }
}

class RatingElement {
  id: number;
  base_document: BaseDocument;
  name: string;
  base_description: string;
  weight: number;

  constructor(obj) {
    this.id = obj.id;
    this.base_document = new BaseDocument(obj.base_document);
    if (obj.name && (obj.name.slice(-1) === '.')) {
      this.name = obj.name.slice(0, - 1);
    } else {
      this.name = obj.name;
    }
    this.base_description = obj.base_description;
    this.weight = obj.weight;
  }
}

class MonthlyRatingElementValue {
  _value: number;
  color: string;

  constructor(value: number) {
    this._value = value;
  }

  get value() {
    if (this._value === null || this._value === undefined) {
      return null
    } else {
      return this._value.toFixed(2).replace('.', ',')
    }
  }

}

export class MonthlyRatingSubElementValue {
  id: number;
  is_average: boolean;
  _value: number;
  is_valid: boolean;
  color: string;
  minusZero: boolean;

  constructor(id: number = null, is_average: boolean = null, value: number = null, is_valid: boolean = true) {
    this.id = id;
    this.is_average = is_average;
    this._value = value ? Number(value) : null;
    this.is_valid = is_valid;
  }

  get value() {
    if (this._value !== null && this._value !== undefined) {
      if (this.minusZero) {
        return '-'
      } else {
        return this._value.toString().replace('.', ',')
      }
    } else {
      return null
    }
  }

  set value(val) {
    if (val !== null && val !== undefined) {
      this._value = Number(val.replace(',', '.'));
    } else {
      this._value = null;
    }
  }

}

export class MonthlyRatingSubElement {
  id?: number;
  tempId: string;
  isSaved: boolean;
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
      this.isSaved = obj.isSaved;
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
        if (this.values[value]._value === null) {
          this.values[value].color = null;
        } else if (this.values[value].is_average) {
          this.values[value].color = '#d6d6d6'
        } else {
          this.values[value].color = getColor(this.values[value]._value, this._min, this._max, this.best_type)
        }

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
  num: number;
  responsible: RatingsUser;
  additional_description: string;
  negotiator_comment: string;
  region_comment: string;
  related_sub_elements?: MonthlyRatingSubElement[];
  best_type: number;
  isSaved: boolean;
  values: Object;

  _min: number;
  _max: number;
  _best: number;
  _avg: number;

  get best() {
    return this._best ? this._best.toFixed(2).replace('.', ',') : null
  }

  get min() {
    if (this._min !== null && this._min !== undefined) {
      return this._min.toFixed(2).replace('.', ',')
    } else {
      return null
    }
  }

  get max() {
    if (this._max !== null && this._max !== undefined) {
      return this._max.toFixed(2).replace('.', ',')
    } else {
      return null
    }
  }

  get avg() {
    if (this._avg !== null && this._avg !== undefined) {
      return this._avg.toFixed(2).replace('.', ',')
    } else {
      return null
    }
  }

  constructor(obj) {
    this.id = obj.id;
    this.monthly_rating = new MonthlyRatingShort(obj.monthly_rating);
    this.rating_element = new RatingElement(obj.rating_element);
    this.num = obj.number;
    this.responsible = new RatingsUser(obj.responsible);
    this.additional_description = obj.additional_description;
    this.negotiator_comment = obj.negotiator_comment;
    this.region_comment = obj.region_comment;
    this.best_type = obj.best_type;
    this.related_sub_elements = [];
    if (obj.related_sub_elements) {
      for (let subElement of obj.related_sub_elements) {
        subElement.isSaved = false;
        this.related_sub_elements.push(new MonthlyRatingSubElement(subElement))
      }
    }
    this.values = {};
    this.setValues(obj)
  }

  weightedValue = (val): string => {
    return (val * this.rating_element.weight).toFixed(1).replace('.', ',')
  };

  setValues = (obj): void => {
    if (obj.values) {
      for (let value in obj.values) {
        if (obj.values.hasOwnProperty(value)) {
          this.values[value] = new MonthlyRatingElementValue(obj.values[value])
        }
      }
    }
  };

  updateCalculatedFields = (): void => {
    this.updateMinValue();
    this.updateMaxValue();
    this.updateBestValue();
    this.updateAvgValue();
    this.setValuesColors();
  };

  setValuesColors = (): void => {
    if (this.values) {
      for (let value in this.values) {
        if (this.values.hasOwnProperty(value)) {
          this.values[value].color = getColor(this.values[value]._value, this._min, this._max, 2);
        }
      }
    }
  };

  setValuesColorsToInvalid = (): void => {
    if (this.values) {
      for (let value in this.values) {
        if (this.values.hasOwnProperty(value)) {
          this.values[value].color = '#d6d6d6'
        }
      }
    }
  };

  updateBestValue = (): void => {
    this._best = this._max;
  };

  getMinValue = (): number => {
    let min = null;
    for (let value in this.values) {
      if (this.values.hasOwnProperty(value)) {
        if (min !== null) {
          if (this.values[value]._value < min) {
            min = this.values[value]._value
          }
        } else {
          min = this.values[value]._value
        }
      }
    }
    return min
  };

  updateMinValue = (): void => {
    this._min = this.getMinValue()
  };

  getMaxValue = (): number => {
    let max = null;
    for (let value in this.values) {
      if (this.values.hasOwnProperty(value)) {
        if (max !== null) {
          if (this.values[value]._value > max) {
            max = this.values[value]._value
          }
        } else {
          max = this.values[value]._value
        }
      }
    }
    return max
  };

  updateMaxValue = (): void => {
    this._max = this.getMaxValue()
  };

  getAverageValue = (): number => {
    let avg = null;
    let sum = null;
    let cnt = 0;
    for (let value in this.values) {
      if (this.values.hasOwnProperty(value)) {
        sum += this.values[value]._value;
        cnt++;
      }
    }
    if (sum !== null && (cnt > 0)) {
      avg = sum / cnt
    }
    return avg;
  };

  updateAvgValue = (): void => {
    this._avg = this.getAverageValue()
  };

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
  sum_values: Map<number, Array<any>>;
  _max_possible_value: number;
  _avg_value: number;

  get max_possible_value() {
    if (this._max_possible_value === null || this._max_possible_value === undefined) {
      return null
    } else {
      return this._max_possible_value.toFixed(1).replace('.', ',')
    }
  }

  get avg_value() {
    if (this._avg_value === null || this._avg_value === undefined ) {
      return null
    } else {
      return this._avg_value.toFixed(1).replace('.', ',')
    }
  }

  constructor(obj) {
    super(obj);
    if (obj) {
      this.base_document = new BaseDocument(obj.base_document);
      this.approved_by = new RatingsUser(obj.approved_by);
      if (obj.elements) {
        console.log(obj.elements);
        let new_elements = [];
        for (let i = 0; i < obj.elements.length; i++) {
          new_elements[i] = new MonthlyRatingElement(obj.elements[i]);
        }
        this.elements = new_elements.filter(_ => _)
        console.log(this.elements);
      }
      this.sum_values = new Map();
      this._max_possible_value = 0;
      this.calculateValues()
    }
  }

  calculateValues = (): void => {
    for (let element of this.elements) {
      this._max_possible_value += element.rating_element.weight;
      for (let region in element.values) {
        if (element.values.hasOwnProperty(region)) {
          let calculated_value = element.values[region]._value * element.rating_element.weight;
          if (region in this.sum_values) {
            this.sum_values[region][0] += calculated_value
          } else {
            this.sum_values[region] = [];
            this.sum_values[region][0] = calculated_value
          }
        }
      }
    }
    let min_value = null;
    let max_value = null;
    let sum = 0;
    let cnt = 0;
    for (let region in this.sum_values) {
      sum += this.sum_values[region][0];
      cnt++;
      if (max_value === null || this.sum_values[region][0] > max_value) {
        max_value = this.sum_values[region][0]
      }
      if (min_value === null || this.sum_values[region][0] < min_value) {
        min_value = this.sum_values[region][0]
      }
    }
    if (cnt !== 0) {
      this._avg_value = sum / cnt;
      this.calculateColors(min_value, max_value);
    }
  };

  calculateColors = (min_value: number, max_value: number): void => {
    for (let region in this.sum_values) {
      this.sum_values[region][1] = getColor(this.sum_values[region][0], min_value, max_value, 2);
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
