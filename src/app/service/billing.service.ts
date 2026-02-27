import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class BillingService {

  baseUrl = `${environment.apiUrl}/billing`;

  constructor(private http: HttpClient){}

  /* ===== SUBSCRIPTION ===== */

  getSubscription(){
    return this.http.get(`${this.baseUrl}/subscription`);
  }

  cancelSubscription(){
    return this.http.put(`${this.baseUrl}/cancel`,{});
  }

  resumeSubscription(){
    return this.http.post(`${this.baseUrl}/resume`,{});
  }

  /* ===== CHECKOUT ===== */

  createCheckout(){
    return this.http.post(`${this.baseUrl}/checkout`,{});
  }

  /* ===== CARD ===== */

  getCard(){
    return this.http.get(`${this.baseUrl}/card`);
  }

  createSetupIntent(){
    return this.http.post(`${this.baseUrl}/card/setup-intent`,{});
  }

  /* ⭐ IMPORTANT → save card as default */
  setDefaultCard(paymentMethodId:string){
    return this.http.post(`${this.baseUrl}/set-default-card`,{
      paymentMethodId
    });
  }

  /* ===== INVOICES ===== */

  getInvoices(){
    return this.http.get(`${this.baseUrl}/invoices`);
  }
}