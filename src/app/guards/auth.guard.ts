 import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const userId = localStorage.getItem('userId');

    if (userId) {
      // User is logged in
      return true;
    } else {
      // User not logged in → redirect to login
      this.router.navigate(['/login']);
      return false;
    }
  }
}
