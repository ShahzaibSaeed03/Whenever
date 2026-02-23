import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environment/environment';
import { StripeService } from '../../service/stripe.service';
import { loadStripe } from '@stripe/stripe-js';

@Component({
  selector:'app-buy-tokens',
  standalone:true,
  imports:[CommonModule,FormsModule],
  templateUrl: './get-token.component.html',
  styleUrl: './get-token.component.css'
})
export class GetTokenComponent  implements OnInit{

  stripe:any;
  checkoutInstance:any=null;

  stripeKey = environment.stripePublishableKey;

  quantity=5;
  quantities=Array.from({length:96},(_,i)=>i+5);

  constructor(private stripeService:StripeService){}

  ngOnInit(){
    this.initCheckout();
  }

async initCheckout(){

  this.stripe = await loadStripe(this.stripeKey);

  this.stripeService.getClientSecret(this.quantity).subscribe(async (res:any)=>{

    const clientSecret=res.clientSecret;

    const checkout = await this.stripe.initEmbeddedCheckout({
      clientSecret
    });

    this.checkoutInstance=checkout;
    checkout.mount('#checkout');
  });
}

  changeQty(){
    if(this.checkoutInstance){
      this.checkoutInstance.destroy();
    }
    this.initCheckout();
  }
}

