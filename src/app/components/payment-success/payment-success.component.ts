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
  ) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id');

    console.log('Stripe session id:', this.sessionId);

    // optional → call backend to confirm payment
    // this.verifySession();
  }

  goDashboard(){
    this.router.navigate(['/dashboard']);
  }
}