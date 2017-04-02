/**
 * Created by evgeniy on 2017-03-20.
 */

import {NgModule}              from '@angular/core';
import {RouterModule, Routes}  from '@angular/router';

import {RatingComponent} from "./components/rating/monthly-rating/monthly-rating.component";
import {RatingElementComponent} from "./components/rating/rating-element/rating-element.component";
import {ConfirmDeactivateGuard} from "./common/confirm-deactivate.guard";
import {CurrentRatingLoaderComponent} from "./components/rating/current-rating-loader/current-rating-loader.component";


const appRoutes: Routes = [
  {path: 'current', component: CurrentRatingLoaderComponent},
  {path: 'rating/:id', component: RatingComponent},
  {
    path: 'rating-element/:id',
    component: RatingElementComponent,
    canDeactivate: [ConfirmDeactivateGuard]
  },
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
