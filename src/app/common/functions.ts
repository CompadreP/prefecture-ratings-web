/**
 * Created by evgeniy on 2017-03-12.
 */

export function displayableMonth(month) {
  switch (month) {
    case 1:
      return 'январь';
    case 2:
      return 'февраль';
    case 3:
      return 'март';
    case 4:
      return 'апрель';
    case 5:
      return 'май';
    case 6:
      return 'июнь';
    case 7:
      return 'июль';
    case 8:
      return 'август';
    case 9:
      return 'сентябрь';
    case 10:
      return 'октябрь';
    case 11:
      return 'ноябрь';
    case 12:
      return 'декабрь';
  }
}

export function generateGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

let cnt = 0;

export function getColor(value: number, min: number, max: number, type: number): string {
  // let newMin = 0;
  if (value) {
    cnt++;
    let newMax;
    let newValue;
    if (min < 0) {
      newMax = max + min;
      newValue = value + min;
    } else {
      newMax = max - min;
      newValue = value - min;
    }
    let multiplexer = 1 / Math.abs(newMax);
    newValue = newValue * multiplexer;
    let result;
    if (type === 1) {
      if (newValue <= 0.5) {
        result = `rgba(${Math.round(newValue * 220)}, 220, 0, 0.5)`
      } else {
        result = `rgba(220, ${Math.round((1 - newValue) * 2 * 220)}, 0, 0.5)`
      }
      console.log(result)

    } else if (type === 2) {
      console.log(value, newValue);
      if (newValue <= 0.5) {
        result = `rgba(${Math.round(newValue * 220)}, 220, 0, 0.5)`
      } else {
        result = `rgba(220, ${Math.round((1 - newValue) * 2 * 220)}, 0, 0.5)`
      }
      console.log(result)
    }
    return result;
  } else {
    return 'none'
  }
}
