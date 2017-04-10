import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { DevelopmentEntryComponent } from './development-entry/development-entry.component';
import { CalculatorOutputComponent } from './calculator-output/calculator-output.component';
import { DevelopmentEntryGroupComponent } from './development-entry-group/development-entry-group.component';
import { KeysPipe } from './keys.pipe';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    DevelopmentEntryComponent,
    CalculatorOutputComponent,
    DevelopmentEntryGroupComponent,
    KeysPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    CommonModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
