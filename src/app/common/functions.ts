/**
 * Created by evgeniy on 2017-03-12.
 */

export function displayableMonth(month: number): string {
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

export function generateGuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getColor(value: number, min: number, max: number, type: number): string {
  let alpha = 0.5;
  if (max === min) {
    return `rgba(0, 220, 0, ${alpha})`
  } else if ((value !== null) || (value !== undefined)) {
    let newMax;
    let newValue;
    let multiplexer;
    newMax = max - min;
    newValue = value - min;
    if (newMax !== 0) {
      multiplexer = 1 / Math.abs(newMax);
    } else {
      multiplexer = 1
    }
    newValue = newValue * multiplexer;
    let result;
    if (type === 1) {
      if (newValue <= 0.5) {
        result = `rgba(${Math.round(newValue * 2 * 220)}, 220, 0, ${alpha})`
      } else {
        result = `rgba(220, ${Math.round((1 - newValue) * 2 * 220)}, 0, ${alpha})`
      }
    } else if (type === 2) {
      if (newValue <= 0.5) {
        result = `rgba(220, ${Math.round(newValue * 2 * 220)}, 0, ${alpha})`
      } else {
        result = `rgba(${Math.round((1 - newValue) * 2 * 220)}, 220, 0, ${alpha})`
      }
    }
    return result;
  } else {
    return null
  }
}

export function getShortString(str: string): string {
  if (str && str.length > 15) {
    return str.substring(0, 13) + '...'
  } else {
    return null
  }
}
