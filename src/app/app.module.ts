import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './app.component';
import { DevelopmentEntryComponent } from './development-entry/development-entry.component';
import { CalculatorOutputComponent } from './calculator-output/calculator-output.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { BuildingTypePipe } from './building-type.pipe';
import { ConstructionTypePipe } from './construction-type.pipe';
import { SplashDialogComponent } from './splash-dialog/splash-dialog.component';
import { HelpDialogComponent } from './help-dialog/help-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    DevelopmentEntryComponent,
    CalculatorOutputComponent,
    BuildingTypePipe,
    ConstructionTypePipe,
    SplashDialogComponent,
    HelpDialogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    CommonModule,
    BrowserAnimationsModule,
    FlexLayoutModule
  ],
  entryComponents: [SplashDialogComponent, HelpDialogComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
