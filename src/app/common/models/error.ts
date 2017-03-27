/**
 * Created by evgeniy on 2017-03-12.
 */
import {translations} from "../translations";

export class RatingsError {
  status: number = null;
  statusText: string = null;
  text: string = null;
  message: string = null;

  constructor (status?: number, statusText?: string, text?: string,
               message?: string) {
    this.status = status;
    this.statusText = statusText;
    this.text = text;
    this.message = message;
  }

  translatedText = (): Object => {
    let parsed = JSON.parse(this.text);
    let translated = {};
    for (let msg in parsed){
      if (parsed.hasOwnProperty(msg)) {
        console.log(parsed[msg]);
        if (parsed[msg] instanceof Array) {
          let transArray = [];
          for (let err of parsed[msg]) {
            transArray.push(translations[err] ? translations[err] : err)
          }
          if (translations[msg]) {
            translated[translations[msg]] = transArray;
          } else {
            translated[msg] = transArray;
          }
        } else {
          if (translations[msg]) {
            translated[translations[msg]] = translations[parsed[msg]] ? translations[parsed[msg]] : parsed[msg];
          } else {
            translated[msg] = translations[parsed[msg]] ? translations[parsed[msg]] : parsed[msg];
          }
        }
      }
    }
    return translated ? translated : null
  };

  translatedTextAsList = (): string => {
    let obj = this.translatedText();
    let text: string = '<ul>';
    for (let err in obj) {
      if (obj.hasOwnProperty(err)) {
        if (obj[err] instanceof Array) {
          let arrText = '';
          for (let line of obj[err]) {
            arrText += `<li>${line}</li>`
          }
          text += `<li>${err}: <ul>${arrText}</ul></li>`;
        } else {
          text += `<li>${err}: ${obj[err]}</li>`
        }
      }
    }
    return text + '</ul>'
  }

}
