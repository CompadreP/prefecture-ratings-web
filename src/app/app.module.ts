import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { CollapseModule } from 'ng2-bootstrap/collapse';
import { ModalModule } from 'ng2-bootstrap/modal';

import { AppComponent } from './app.component';
import {NavbarComponent} from "./components/navbar/navbar.component";
import {LoginModalComponent} from "./components/login-modal/login-modal.component";

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginModalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,

    CollapseModule,
    ModalModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
