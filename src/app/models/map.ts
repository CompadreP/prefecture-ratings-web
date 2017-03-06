/**
 * Created by evgeniy on 2017-03-05.
 */


export class Region {
  id: number;
  name: string;

  // constructor(id: number, name: string) {
  //   this.id = id;
  //   this.name = name;
  // }
}

export class District {
  id: number;
  name: string;

  // constructor(id: number, name: string) {
  //   this.id = id;
  //   this.name = name;
  // }
}

export class Organization {
  id: number;
  name: string;
  region: Region | null;
  district: District;

  // constructor(id: number, name: string, region: Region = null, district: District) {
  //   this.id = id;
  //   this.name = name;
  //   this.region = region;
  //   this.district = district;
  // }
}
