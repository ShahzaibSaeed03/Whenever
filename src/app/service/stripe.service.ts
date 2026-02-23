import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class StripeService {

  baseUrl=`${environment.apiUrl}/stripe`;

  constructor(private http:HttpClient){}

  getClientSecret(qty:number){
    return this.http.post(`${this.baseUrl}/create-checkout-session/${qty}`,{});
  }
    getCard(){
    return this.http.get(`${this.baseUrl}/card`);
  }

  /* SETUP INTENT */
  createSetupIntent(){
    return this.http.post(`${this.baseUrl}/card/setup-intent`,{});
  }
}