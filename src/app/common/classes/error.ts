/**
 * Created by evgeniy on 2017-03-12.
 */

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
}
