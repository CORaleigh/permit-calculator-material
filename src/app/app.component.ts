import { Component, OnInit } from '@angular/core';
import { MdDialog } from '@angular/material';

import { SplashDialogComponent } from './splash-dialog/splash-dialog.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isResidential: boolean = false;
  title = 'Building and Trade Permit Fee Calculator';
  handleIsResidentialUpdated(isResidential) {
    this.isResidential = isResidential;
  }
  constructor(public dialog: MdDialog) {};
  ngOnInit(): void {
   window.setTimeout(() => {
      this.dialog.open(SplashDialogComponent);

    }, 500);
  }
}
