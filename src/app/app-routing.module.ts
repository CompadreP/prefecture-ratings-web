/**
 * Created by evgeniy on 2017-03-20.
 */

import {NgModule}              from '@angular/core';
import {RouterModule, Routes}  from '@angular/router';

import {RatingComponent} from "./components/rating/monthly-rating/monthly-rating.component";
import {RatingElementComponent} from "./components/rating/rating-element/rating-element.component";

const appRoutes: Routes = [
  {path: 'current', component: RatingComponent},
  {path: 'rating/:id', component: RatingComponent},
  {path: 'rating-element/:id', component: RatingElementComponent},
  {
    path: '',
    redirectTo: '/current',
    pathMatch: 'full'
  },
];


@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
