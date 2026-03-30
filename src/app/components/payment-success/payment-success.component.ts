import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthApiService } from '../../service/auth-api.service';
import { AuthService } from '../../service/auth-service.service';
import { WorkService } from '../../service/work-service.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-success.component.html'
})
export class PaymentSuccessComponent implements OnInit {
  tokens = 0;
  billingDate = '';
  sessionId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workService: WorkService,
    private authService: AuthService,
    private authApi: AuthApiService
  ) { }

  ngOnInit(): void {
    localStorage.removeItem('signup_form');
    localStorage.removeItem('pending_payment');

    this.authService.isLoggedIn$.subscribe(status => {


      if (status) {
        this.loadTokenData();
      } else {
        this.tokens = 0;
        this.billingDate = '';
      }

    });
  }
isTokenLoaded = false;
  loadTokenData() {
  this.workService.getTokenDetails()
  .subscribe((res: any) => {
    this.tokens = res.remainingTokens;
    this.billingDate = res.nextBillingDate;
    this.isTokenLoaded = true; // ✅ mark loaded
  });
    // optional → call backend to confirm payment
    // this.verifySession();
  }

  goDashboard() {
    this.router.navigate(['/dashboard']);
  }
}