import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {CommonModule}   from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {CollapseModule} from 'ng2-bootstrap/collapse';
import {ModalModule} from 'ng2-bootstrap/modal';
import {DropdownModule} from 'ng2-bootstrap/dropdown';
import {TooltipModule} from "ng2-bootstrap";
import {Autosize} from 'angular2-autosize/angular2-autosize';
import {ContextMenuModule} from "angular2-contextmenu";

import {AppComponent} from './app.component';
import {NavbarComponent} from "./components/navbar/navbar.component";
import {AuthenticationComponent} from "./components/authentication/authentication.component";
import {RatingComponent} from './components/rating/monthly-rating/monthly-rating.component';
import {NotificationModalComponent} from './components/notification/notification.component';
import {RatingElementComponent} from './components/rating/rating-element/rating-element.component';
import {AppRoutingModule} from './app-routing.module';
import {ConfirmDeactivateGuard} from "./common/confirm-deactivate.guard";
import {CurrentRatingLoaderComponent} from './components/rating/current-rating-loader/current-rating-loader.component';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {ROOT_API_URL} from "../settings";


@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    BrowserModule,
    FormsModule,
    CollapseModule,
    ContextMenuModule,
    ModalModule.forRoot(),
    DropdownModule.forRoot(),
    TooltipModule.forRoot(),
    AppRoutingModule,
  ],
  declarations: [
    Autosize,
    AppComponent,
    NotificationModalComponent,
    NavbarComponent,
    AuthenticationComponent,
    RatingComponent,
    RatingElementComponent,
    CurrentRatingLoaderComponent,
  ],
  providers: [
    ConfirmDeactivateGuard,
    {
        provide: 'externalUrlRedirectResolver',
        useValue: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        {
          window.location.href = `${ROOT_API_URL}/${route.url}`;
        }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
