import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StripeService } from '../../service/stripe.service';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environment/environment';
import { WorkService } from '../../service/work-service.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-buy-tokens',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './get-token.component.html'
})
export class GetTokenComponent implements OnInit {

  stripe: any;
  checkoutInstance: any = null;
  tokens = 0;
  billingDate = '';
  stripeKey = environment.stripePublishableKey;

  quantity = 5;
  min = 5;
  max = 100;
  step = 5;

  quantities = Array.from(
    { length: (this.max - this.min) / this.step + 1 },
    (_, i) => this.min + i * this.step
  ); subscriptionActive = false;

  constructor(private stripeService: StripeService, private workService: WorkService) { }

  ngOnInit() {
    console.log("Stripe Publishable Key:", this.stripeKey);
    this.workService.getTokenDetails()
      .subscribe((res: any) => {

        this.tokens = res.remainingTokens;
        this.billingDate = res.nextBillingDate;

      });
    this.checkSubscription()
  }

  checkSubscription() {
    this.stripeService.getSubscriptionStatus().subscribe((res: any) => {
      this.subscriptionActive = !!res.nextBillingDate;

      if (this.subscriptionActive) {
        this.initCheckout();
      }
    });
  }

 async initCheckout() {

  // prevent multiple checkout instances
  if (this.checkoutInstance) {
    this.checkoutInstance.destroy();
    this.checkoutInstance = null;
  }

  this.stripe = await loadStripe(this.stripeKey);

  this.stripeService.getClientSecret(this.quantity)
    .subscribe(async (res: any) => {

      const checkout = await this.stripe.initEmbeddedCheckout({
        clientSecret: res.clientSecret
      });

      this.checkoutInstance = checkout;

      checkout.mount('#checkout');

      checkout.on('complete', () => {
        checkout.destroy();
        this.checkoutInstance = null;

        // refresh tokens after purchase
        this.workService.getTokenDetails()
          .subscribe((res:any)=>{
            this.tokens = res.remainingTokens;
          });
      });

    });

}

changeQty() {

  if (this.checkoutInstance) {
    this.checkoutInstance.destroy();
    this.checkoutInstance = null;
  }

  setTimeout(() => {
    this.initCheckout();
  }, 100);

}
}