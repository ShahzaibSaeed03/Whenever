import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StripeService } from '../../service/stripe.service';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environment/environment';
import { WorkService } from '../../service/work-service.service';

@Component({
  selector: 'app-buy-tokens',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './get-token.component.html'
})
export class GetTokenComponent implements OnInit, OnDestroy {

  stripe: any;
  checkoutInstance: any = null;
  isTokenLoaded = false;
  tokens = 0;
  billingDate = '';
  stripeKey = environment.stripePublishableKey;

  quantity = 5;
  min = 5;
  max = 100;
  step = 5;

  subscriptionActive = false;

  quantities = Array.from(
    { length: (this.max - this.min) / this.step + 1 },
    (_, i) => this.min + i * this.step
  );

  constructor(
    private stripeService: StripeService,
    private workService: WorkService
  ) { }

  async ngOnInit() {

    this.stripe = await loadStripe(this.stripeKey);

   this.workService.getTokenDetails()
  .subscribe((res: any) => {
    this.tokens = res.remainingTokens;
    this.billingDate = res.nextBillingDate;
    this.isTokenLoaded = true; 
  });

    this.checkSubscription();
  }

  ngOnDestroy() {
    this.destroyCheckout();
  }

  checkSubscription() {
    this.stripeService.getSubscriptionStatus().subscribe((res: any) => {

      this.subscriptionActive = !!res.nextBillingDate;

      if (this.subscriptionActive) {
        this.initCheckout();
      }

    });
  }

  destroyCheckout() {

    if (this.checkoutInstance) {
      this.checkoutInstance.destroy();
      this.checkoutInstance = null;
    }

    const container = document.getElementById('checkout');
    if (container) {
      container.innerHTML = '';
    }

  }

  async initCheckout() {

    this.destroyCheckout();

    this.stripeService.getClientSecret(this.quantity)
      .subscribe(async (res: any) => {

        const checkout = await this.stripe.initEmbeddedCheckout({
          clientSecret: res.clientSecret
        });

        this.checkoutInstance = checkout;

        checkout.mount('#checkout');

        checkout.on('complete', () => {

          this.destroyCheckout();

          this.workService.getTokenDetails()
            .subscribe((res: any) => {
              this.tokens = res.remainingTokens;
              this.billingDate = res.nextBillingDate;
            });

          this.initCheckout();

        });

      });

  }

  changeQty() {
    if (this.subscriptionActive) {
      this.initCheckout();
    }
  }

}