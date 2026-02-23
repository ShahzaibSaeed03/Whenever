import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class AuthApiService {

  private base = environment.apiUrl ;

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.base}/auth/register`, data);
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.base}/auth/login`, data);
  }

getTokenHistory(){
  return this.http.get(`${this.base}/tokens/history`);
}


getProfile(){
  return this.http.get(`${this.base}/users/profile`);
}

updateProfile(data:any){
  return this.http.put(`${this.base}/users/profile`,data);
}

changePassword(data:any){
  return this.http.put(`${this.base}/users/change-password`,data);
}

requestEmailChange(email:string){
  return this.http.put(`${this.base}/users/change-email`,{newEmail:email});
}

confirmEmail(code:string){
  return this.http.put(`${this.base}/users/confirm-email`,{code});
}
}

