/**
 * Created by evgeniy on 2017-03-13.
 */
import {Injectable} from "@angular/core";
import {RequestsService} from "./requests.service";
import {ROOT_API_URL} from "../../settings";
import {BehaviorSubject} from "rxjs";

@Injectable()
export class RegionsService {
  private regionsUrl: string = `${ROOT_API_URL}/api/map/regions/`;

  private _regions$ = new BehaviorSubject(null);
  public regionsLoaded$ = this._regions$.asObservable();

  constructor(private requestsService: RequestsService) {
    this.loadRegions();
  }

  loadRegions = () => {
    this.requestsService.http.get(
      this.regionsUrl,
      this.requestsService.options
    )
      .map(this.requestsService.extractData)
      .catch(this.requestsService.handleError)
      .subscribe(
        data => {
          this._regions$.next(data);
        },
        error => {
          console.log(error);
        }
      )
  }
}
