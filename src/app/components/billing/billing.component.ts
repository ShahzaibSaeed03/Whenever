import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { StripeService } from '../../service/stripe.service';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environment/environment';
import { BillingService } from '../../service/billing.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class BillingComponent implements OnInit {

  subscription: any;
  invoices: any[] = [];
  card: any;
cardNumber:any;
cardExpiry:any;
cardCvc:any;
  cardModal = false;

  stripe: any;
  elements: any;
  cardElement: any;

  constructor(private BillingService: BillingService) { }

  async ngOnInit() {

    /* LOAD DATA */

    this.loadSubscription();

    this.BillingService.getInvoices()
      .subscribe((res: any) => this.invoices = res);

    this.BillingService.getCard()
      .subscribe((res: any) => this.card = res);
  }

  /* CANCEL SUB */
cancel(){
  this.BillingService.cancelSubscription().subscribe(()=>{
    this.loadSubscription();
  });
}

  /* MODAL */
  openCardModal() {
    this.cardModal = true;
    this.mountCard();
  }

  closeCardModal() {
    this.cardModal = false;
  }

  /* STRIPE CARD UPDATE */

async mountCard(){

  this.stripe = await loadStripe(environment.stripePublishableKey);

  const elements = this.stripe.elements();

  this.cardNumber = elements.create('cardNumber');
  this.cardExpiry = elements.create('cardExpiry');
  this.cardCvc = elements.create('cardCvc');

  setTimeout(()=>{
    this.cardNumber.mount('#card-number');
    this.cardExpiry.mount('#card-expiry');
    this.cardCvc.mount('#card-cvc');
  });
}

  updateCard(){

  this.BillingService.createSetupIntent().subscribe(async (res:any)=>{

    const {error} = await this.stripe.confirmCardSetup(
      res.clientSecret,
      {
        payment_method:{
          card:this.cardNumber
        }
      }
    );

    if(!error){
      this.closeCardModal();
      this.BillingService.getCard().subscribe(c=>this.card=c);
    }
  });
}

  /* DOWNLOAD INVOICE */
  download(url: string) {
    window.open(url, '_blank');
  }
  resume() {
    this.BillingService.resumeSubscription().subscribe(() => {
      this.loadSubscription();
    });
  }
  loadSubscription() {
    this.BillingService.getSubscription()
      .subscribe((res: any) => this.subscription = res);
  }
  get renewalMessage(): { title:string; description:string } {

  if(!this.subscription){
    return {
      title:'',
      description:''
    };
  }

  const date = new Date(this.subscription.subscriptionEnd)
    .toLocaleDateString();

  if(this.subscription.autoRenew){
    return {
      title:`Your annual subscription is paid until ${date}, and the automatic renewal is on.`,
      description:`You can cancel the automatic renewal by clicking on the button below.`
    };
  }

  return {
    title:`Your annual subscription is paid until ${date}, and the automatic renewal is off.`,
    description:`One month after the end of your subscription, we will remove all your files from our database. Before the end of your subscription, download all your works. Each zip contains your work, certificate and hash. Your works remain legally protected.`
  };
}
}