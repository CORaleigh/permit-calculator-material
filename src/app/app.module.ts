import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { DevelopmentEntryComponent } from './development-entry/development-entry.component';
import { CalculatorOutputComponent } from './calculator-output/calculator-output.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { BuildingTypePipe } from './building-type.pipe';
import { ConstructionTypePipe } from './construction-type.pipe';

@NgModule({
  declarations: [
    AppComponent,
    DevelopmentEntryComponent,
    CalculatorOutputComponent,
    BuildingTypePipe,
    ConstructionTypePipe
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
