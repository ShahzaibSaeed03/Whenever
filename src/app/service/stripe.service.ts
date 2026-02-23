import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class StripeService {

  baseUrl = `${environment.apiUrl}`;

  constructor(private http:HttpClient){}

  /* ===== SUBSCRIPTION ===== */

  createSubscription(){
    return this.http.post(`${this.baseUrl}/billing/subscription-checkout`,{});
  }

  getSubscriptionStatus(){
    return this.http.get(`${this.baseUrl}/subscription/status`);
  }

  /* ===== TOKENS ===== */

  getClientSecret(qty:number){
    return this.http.post(`${this.baseUrl}/stripe/create-checkout-session/${qty}`,{});
  }
}