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
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './get-token.component.html'
})
export class GetTokenComponent implements OnInit {

  stripe: any;
  checkoutInstance: any = null;
  tokens = 0;
  billingDate = '';
  stripeKey = environment.stripePublishableKey;

  quantity = 5;
  quantities = Array.from({ length: 96 }, (_, i) => i + 5);

  subscriptionActive = false;

  constructor(private stripeService: StripeService, private workService: WorkService) { }

  ngOnInit() {
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

    this.stripe = await loadStripe(this.stripeKey);

    this.stripeService.getClientSecret(this.quantity)
      .subscribe(async (res: any) => {
        console.log("STRIPE RESPONSE 👉", res);

        const checkout = await this.stripe.initEmbeddedCheckout({
          clientSecret: res.clientSecret
        });

        this.checkoutInstance = checkout;
        checkout.mount('#checkout');
      });
  }

  changeQty() {
    if (this.checkoutInstance) {
      this.checkoutInstance.destroy();
    }
    this.initCheckout();
  }
}