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

  subscription:any;
  invoices:any[]=[];
  card:any;

  cardNumber:any;
  cardExpiry:any;
  cardCvc:any;

  cardModal=false;

  stripe:any;

  tokens=0;
  billingDate='';

  constructor(
    private billingService:BillingService,
    private workService:WorkService,
    private toast:ToastrService
  ){}

  async ngOnInit(){

    this.loadSubscription();

    this.billingService.getInvoices()
      .subscribe({
        next:(res:any)=>this.invoices=res,
        error:()=>this.toast.error('Failed to load invoices')
      });

    this.billingService.getCard()
      .subscribe({
        next:(res:any)=>this.card=res,
        error:()=>this.toast.error('Failed to load card')
      });

    this.workService.getTokenDetails()
      .subscribe((res:any)=>{
        this.tokens=res.remainingTokens;
        this.billingDate=res.nextBillingDate;
      });
  }

  /* CANCEL */
  cancel(){
    this.billingService.cancelSubscription()
      .subscribe({
        next:()=>{
          this.toast.success('Subscription will cancel at period end');
          this.loadSubscription();
        },
        error:()=>this.toast.error('Cancel failed')
      });
  }

  /* RESUME */
  resume(){
    this.billingService.resumeSubscription()
      .subscribe({
        next:()=>{
          this.toast.success('Subscription resumed');
          this.loadSubscription();
        },
        error:()=>this.toast.error('Resume failed')
      });
  }

  /* MODAL */
  openCardModal(){
    this.cardModal=true;
    this.mountCard();
  }

  closeCardModal(){
    this.cardModal=false;
  }

  /* STRIPE MOUNT */
  async mountCard(){

    this.stripe=await loadStripe(environment.stripePublishableKey);

    const elements=this.stripe.elements();

    const style={
      base:{
        fontSize:'16px',
        color:'#1f2937',
        '::placeholder':{ color:'#9ca3af' }
      }
    };

    this.cardNumber=elements.create('cardNumber',{style});
    this.cardExpiry=elements.create('cardExpiry',{style});
    this.cardCvc=elements.create('cardCvc',{style});

    setTimeout(()=>{
      this.cardNumber.mount('#card-number');
      this.cardExpiry.mount('#card-expiry');
      this.cardCvc.mount('#card-cvc');
    });
  }

  /* UPDATE CARD */
  async updateCard(){

    this.billingService.createSetupIntent()
      .subscribe(async(res:any)=>{

        const result=await this.stripe.confirmCardSetup(
          res.clientSecret,
          { payment_method:{ card:this.cardNumber } }
        );

        if(result.error){
          this.toast.error(result.error.message || 'Card failed');
          return;
        }

        const paymentMethodId=result.setupIntent.payment_method;

        this.billingService.setDefaultCard(paymentMethodId)
          .subscribe({
            next:()=>{
              this.toast.success('Card updated');
              this.closeCardModal();

              this.billingService.getCard()
                .subscribe(c=>this.card=c);
            },
            error:()=>this.toast.error('Failed to save card')
          });

      });
  }

  download(url:string){
    window.open(url,'_blank');
  }

  loadSubscription(){
    this.billingService.getSubscription()
      .subscribe({
        next:(res:any)=>this.subscription=res,
        error:()=>this.toast.error('Failed to load subscription')
      });
  }

  get renewalMessage(){

    if(!this.subscription){
      return {title:'',description:''};
    }

    const date=new Date(this.subscription.subscriptionEnd).toLocaleDateString();

    if(this.subscription.autoRenew){
      return{
        title:`Your annual subscription is paid until ${date}, and the automatic renewal is on.`,
        description:`You can cancel the automatic renewal by clicking on the button below.`
      };
    }

    return{
      title:`Your annual subscription is paid until ${date}, and the automatic renewal is off.`,
      description:`One month after the end of your subscription, we will remove all your files from our database.`
    };
  }
}