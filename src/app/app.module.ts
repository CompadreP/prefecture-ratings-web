import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {CommonModule}   from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {CollapseModule} from 'ng2-bootstrap/collapse';
import {ModalModule} from 'ng2-bootstrap/modal';
import {DropdownModule} from 'ng2-bootstrap/dropdown';
import {Autosize} from 'angular2-autosize/angular2-autosize';
import {CustomFormsModule} from 'ng2-validation'

import {AppComponent} from './app.component';
import {NavbarComponent} from "./components/navbar/navbar.component";
import {LoginModalComponent} from "./components/authentication/login-modal.component";
import {RatingComponent} from './components/rating/monthly-rating/monthly-rating.component';
import {NotificationModalComponent} from './components/notification-modal/notification-modal.component';
import {RatingElementComponent} from './components/rating/rating-element/rating-element.component';
import {AppRoutingModule} from './app-routing.module';


@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    BrowserModule,
    FormsModule,
    CustomFormsModule,
    CollapseModule,
    ModalModule.forRoot(),
    DropdownModule.forRoot(),
    AppRoutingModule
  ],
  declarations: [
    Autosize,
    AppComponent,
    NotificationModalComponent,
    NavbarComponent,
    LoginModalComponent,
    RatingComponent,
    RatingElementComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
