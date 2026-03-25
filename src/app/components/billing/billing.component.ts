import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environment/environment';
import { BillingService } from '../../service/billing.service';
import { WorkService } from '../../service/work-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './billing.component.html'
})
export class BillingComponent implements OnInit {

  subscriptionLoaded = false;
  isTokenLoaded = false;

  subscription: any;
  invoices: any[] = [];
  card: any;

  tokens = 0;
  billingDate: any = '';

  cardNumber: any;
  cardExpiry: any;
  cardCvc: any;

  cardModal = false;
  stripe: any;
  updatingCard = false;

  constructor(
    private billingService: BillingService,
    private workService: WorkService,
    private toast: ToastrService
  ) {}

  async ngOnInit() {

    this.loadSubscription();

    this.billingService.getInvoices()
      .subscribe({
        next: (res: any) => this.invoices = res,
        error: () => this.toast.error('Failed to load invoices')
      });

    this.billingService.getCard()
      .subscribe({
        next: (res: any) => this.card = res,
        error: () => this.toast.error('Failed to load card')
      });

    this.workService.getTokenDetails()
      .subscribe({
        next: (res: any) => {
          this.tokens = res.remainingTokens;
          this.billingDate = res.nextBillingDate;
          this.isTokenLoaded = true;
        },
        error: () => {
          this.toast.error('Failed to load tokens');
          this.isTokenLoaded = true;
        }
      });
  }

  /* LOAD SUBSCRIPTION */
  loadSubscription() {
    this.billingService.getSubscription()
      .subscribe({
        next: (res: any) => {
          this.subscription = res;
          this.subscriptionLoaded = true;
        },
        error: () => {
          this.toast.error('Failed to load subscription');
          this.subscriptionLoaded = true;
        }
      });
  }

  /* CANCEL */
  cancel() {
    this.billingService.cancelSubscription()
      .subscribe({
        next: () => {
          this.toast.success('Auto renewal disabled. Subscription active until expiry.');
          this.loadSubscription();
        },
        error: () => this.toast.error('Cancel failed')
      });
  }

  /* REACTIVATE */
  resume() {
    this.billingService.resumeSubscription()
      .subscribe({
        next: () => {
          this.toast.success('Subscription reactivated');
          this.loadSubscription();
        },
        error: () => this.toast.error('Reactivation failed')
      });
  }

  /* RENEWAL MESSAGE */
  get renewalMessage() {

    if (!this.subscription) {
      return { title: '', description: '' };
    }

    const date = this.subscription.subscriptionEnd
      ? new Date(this.subscription.subscriptionEnd).toLocaleDateString('en-GB')
      : '';

    if (this.subscription.autoRenew) {
      return {
        title: `Your annual subscription is paid until ${date}, and the automatic renewal is on.`,
        description: `You can cancel the automatic renewal by clicking on the button below.`
      };
    }

    return {
      title: `Your annual subscription is paid until ${date}, and the automatic renewal is off.`,
      description: `One month after the end of your subscription, we will remove all your files from our database (your uploaded works and the corresponding certificates).

Before the end of your subscription, download all your works: you have one zip file per work. Each zip file contains your work (the file that you uploaded – in general it is a zip file), its Certificate and its Certificate hash code.

So your works are still protected. In case of a dispute, you have to supply the Court with the zip file, as a proof of the declaration date of your authorship.

You can reactivate the automatic renewal by clicking on the button below.`
    };
  }

  /* MODAL */
  openCardModal() {
    this.cardModal = true;
    this.mountCard();
  }

  closeCardModal() {
    this.cardModal = false;

    if (this.cardNumber) {
      this.cardNumber.destroy();
      this.cardExpiry.destroy();
      this.cardCvc.destroy();
    }
  }

  /* STRIPE */
  async mountCard() {

    this.stripe = await loadStripe(environment.stripePublishableKey);

    const elements = this.stripe.elements();

    const style = {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        '::placeholder': { color: '#9ca3af' }
      }
    };

    if (this.cardNumber) {
      this.cardNumber.destroy();
      this.cardExpiry.destroy();
      this.cardCvc.destroy();
    }

    this.cardNumber = elements.create('cardNumber', { style });
    this.cardExpiry = elements.create('cardExpiry', { style });
    this.cardCvc = elements.create('cardCvc', { style });

    setTimeout(() => {
      this.cardNumber.mount('#card-number');
      this.cardExpiry.mount('#card-expiry');
      this.cardCvc.mount('#card-cvc');
    });
  }

  /* UPDATE CARD */
  async updateCard() {

    if (this.updatingCard) return;
    this.updatingCard = true;

    this.billingService.createSetupIntent()
      .subscribe(async (res: any) => {

        const result = await this.stripe.confirmCardSetup(
          res.clientSecret,
          {
            payment_method: {
              card: this.cardNumber
            }
          }
        );

        this.updatingCard = false;

        if (result.error) {
          this.toast.error(result.error.message || 'Card failed');
          return;
        }

        const paymentMethodId = result.setupIntent.payment_method;

        this.billingService.setDefaultCard(paymentMethodId)
          .subscribe({
            next: () => {
              this.toast.success('Card updated');

              this.cardNumber.destroy();
              this.cardExpiry.destroy();
              this.cardCvc.destroy();

              this.cardModal = false;

              this.billingService.getCard()
                .subscribe(c => this.card = c);
            },
            error: () => this.toast.error('Failed to save card')
          });

      });
  }

  download(url: string) {
    window.open(url, '_blank');
  }
}