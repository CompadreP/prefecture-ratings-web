import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { CollapseModule } from 'ng2-bootstrap/collapse';
import { ModalModule } from 'ng2-bootstrap/modal';

import { AppComponent } from './app.component';
import {NavbarComponent} from "./components/navbar/navbar.component";
import {LoginModalComponent} from "./components/login-modal/login-modal.component";
import { RatingComponent } from './components/rating/rating.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,

    CollapseModule,
    ModalModule.forRoot(),
  ],
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginModalComponent,
    RatingComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
