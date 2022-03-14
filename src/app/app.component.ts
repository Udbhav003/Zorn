import { Component } from '@angular/core';
import { Helper } from './utils/helper.util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Zorn';

  constructor() {
    Helper.isNextStep = false;
  }
}
