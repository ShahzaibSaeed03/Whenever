import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  /* ================= LOGIN STATE ================= */

  private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  isLoggedIn$ = this.loggedIn.asObservable();

  /* ================= USER STATE ================= */

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor() {}

  /* ================= AUTH ================= */

  login(token: string) {
    localStorage.setItem('token', token);
    this.loggedIn.next(true);
  }

  logout() {
    localStorage.removeItem('token');
    this.loggedIn.next(false);
    this.userSubject.next(null); // 🔥 clear user
  }

  checkLogin() {
    this.loggedIn.next(!!localStorage.getItem('token'));
  }

  getToken() {
    return localStorage.getItem('token');
  }

  /* ================= USER ================= */

  setUser(user: any) {
    this.userSubject.next(user); // 🔥 global update
  }

  getUser() {
    return this.userSubject.value;
  }
}