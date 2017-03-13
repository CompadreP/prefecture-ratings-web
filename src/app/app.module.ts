import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {CommonModule}   from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpModule, XSRFStrategy, CookieXSRFStrategy} from '@angular/http';

import {CollapseModule} from 'ng2-bootstrap/collapse';
import {ModalModule} from 'ng2-bootstrap/modal';
import {DropdownModule} from 'ng2-bootstrap/dropdown';

import {AppComponent} from './app.component';
import {NavbarComponent} from "./components/navbar/navbar.component";
import {LoginModalComponent} from "./components/authentication/login-modal.component";
import {RatingComponent} from './components/rating/rating.component';
import { NotificationModalComponent } from './components/notification-modal/notification-modal.component';


@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    BrowserModule,
    FormsModule,
    CollapseModule,
    ModalModule.forRoot(),
    DropdownModule.forRoot(),
  ],
  declarations: [
    AppComponent,
    NotificationModalComponent,
    NavbarComponent,
    LoginModalComponent,
    RatingComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
