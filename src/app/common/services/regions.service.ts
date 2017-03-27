/**
 * Created by evgeniy on 2017-03-13.
 */
import {Injectable} from "@angular/core";
import {RequestsService} from "./requests.service";
import {ROOT_API_URL} from "../../../settings";
import {Region} from "../models/map";
import {NotificationService} from "../../components/notification/notification.service";


@Injectable()
export class RegionsService {
  private regionsUrl: string = `${ROOT_API_URL}/api/map/regions/`;

  regions: Region[];
  regionsNumbers;

  constructor(private reqS: RequestsService,
              private notiS: NotificationService) {
    this.loadRegions();
    this.regions = [];
    this.regionsNumbers = {};
  }

  loadRegions = () => {
    this.reqS.http.get(
      this.regionsUrl,
      this.reqS.options
    )
      .map(this.reqS.extractData)
      .catch(this.reqS.handleError)
      .subscribe(
        regions => {
          for (let region in regions) {
            if (regions.hasOwnProperty(region)) {
              this.regions.push(new Region(regions[region]))
            }
          }
          let n = 0;
          for (let region of this.regions) {
            this.regionsNumbers[region.id] = n;
            n++;
          }
          if (this.isRegionsInLocalStorageValid()) {
            this.regions = JSON.parse(localStorage.getItem('regionsDisplay'))
          }
        },
        error => {
          this.notiS.notificateError(error);
          console.log(error);
        }
      )
  };

  isRegionsInLocalStorageValid = () => {
    let localStorageRegions = JSON.parse(localStorage.getItem('regionsDisplay'));
    if (localStorageRegions === null) {
      console.log('regions localstorage null');
      return false
    }
    if (this.regions.length !== localStorageRegions.length) {
      localStorage.removeItem('regionsDisplay');
      console.log('regions different length');
      return false;
    } else {
      let this_regions = {};
      for (let region in this.regions) {
        if (this.regions.hasOwnProperty(region)) {
          this_regions[this.regions[region].id] = this.regions[region].name
        }
      }
      let local_regions = {};
      for (let region in localStorageRegions) {
        if (localStorageRegions.hasOwnProperty(region)) {
          local_regions[localStorageRegions[region].id] = localStorageRegions[region].name
        }
      }
      for (let region in this_regions) {
        if (this.regions.hasOwnProperty(region)) {
          if (this_regions[region] !== local_regions[region]) {
            localStorage.removeItem('regionsDisplay');
            console.log('regions different name', this_regions[region], local_regions[region]);
            return false;
          }
        }
      }
    }
    return true;
  };

}
