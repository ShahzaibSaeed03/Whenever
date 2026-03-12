import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-success.component.html'
})
export class PaymentSuccessComponent implements OnInit {

  sessionId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    localStorage.removeItem('signup_form');
    localStorage.removeItem('pending_payment');

    // optional → call backend to confirm payment
    // this.verifySession();
  }

  goDashboard() {
    this.router.navigate(['/dashboard']);
  }
}