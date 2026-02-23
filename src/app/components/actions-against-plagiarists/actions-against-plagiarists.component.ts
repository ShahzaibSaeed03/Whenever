import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WorkService } from '../../service/work-service.service';

@Component({
  selector: 'app-actions-against-plagiarists',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './actions-against-plagiarists.component.html'
})
export class ActionsAgainstPlagiaristsComponent {

  tokens = 0;
 
  billingDate = '';

  openMain = false;
  openUS = false;
  openEU = false;
  openUK = false;


constructor(
private workService:WorkService,
private toast:ToastrService
){}

ngOnInit(){

this.workService.getTokenDetails()
  .subscribe((res:any)=>{

    this.tokens = res.remainingTokens;
    this.billingDate = res.nextBillingDate;

  });
  
}


  toggleMain(){ this.openMain = !this.openMain; }
  toggleUS(){ this.openUS = !this.openUS; }
  toggleEU(){ this.openEU = !this.openEU; }
  toggleUK(){ this.openUK = !this.openUK; }

}