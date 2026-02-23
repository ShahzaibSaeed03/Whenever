import { Component } from '@angular/core';
import { StripeService } from '../../service/stripe.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../environment/environment';
import { loadStripe } from '@stripe/stripe-js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pricing',
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css'
})
export class PricingComponent {

  stripe:any;
  checkoutInstance:any=null;

  showCheckout=false;
  showLoginGate=false;
  loading=false;

  constructor(
    private stripeService:StripeService,
    private router:Router
  ){}

  isLoggedIn(){
    return !!localStorage.getItem('token'); // adjust if you store differently
  }

  async subscribe(){

    if(!this.isLoggedIn()){
      this.showLoginGate=true;
      return;
    }

    if(this.loading) return;
    this.loading=true;

    if(this.checkoutInstance){
      this.checkoutInstance.destroy();
      this.checkoutInstance=null;
    }

    this.showCheckout=true;

    this.stripe = await loadStripe(environment.stripePublishableKey);

    this.stripeService.createSubscription().subscribe(async (res:any)=>{
      const checkout = await this.stripe.initEmbeddedCheckout({
        clientSecret:res.clientSecret
      });

      this.checkoutInstance=checkout;
      checkout.mount('#subscription-checkout');
      this.loading=false;
    });
  }

  close(){
    if(this.checkoutInstance){
      this.checkoutInstance.destroy();
      this.checkoutInstance=null;
    }
    this.showCheckout=false;
  }

  goLogin(){
    this.router.navigate(['/login']);
  }

  goRegister(){
    this.router.navigate(['/register']);
  }
}