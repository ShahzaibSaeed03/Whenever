import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-actions-against-plagiarists',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './actions-against-plagiarists.component.html'
})
export class ActionsAgainstPlagiaristsComponent {

  openMain = false;
  openUS = false;
  openEU = false;
  openUK = false;

  toggleMain(){ this.openMain = !this.openMain; }
  toggleUS(){ this.openUS = !this.openUS; }
  toggleEU(){ this.openEU = !this.openEU; }
  toggleUK(){ this.openUK = !this.openUK; }

}