import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isResidential: boolean = false;
  title = 'Permit Calculator';
  handleIsResidentialUpdated(isResidential) {
    debugger;
    this.isResidential = isResidential;
  }
}
