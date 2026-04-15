import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AuthApiService } from '../../service/auth-api.service';
import { AuthService } from '../../service/auth-service.service';
import { StripeService } from '../../service/stripe.service';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environment/environment';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, ToastrModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm!: FormGroup;
  showPassword = false;
  loading = false;

  /* ===== STRIPE ===== */
  showCheckout = false;
  loadingCheckout = false;
  stripe: any;
  checkoutInstance: any = null;

  constructor(
    private fb: FormBuilder,
    private api: AuthApiService,
    private auth: AuthService,
    private toast: ToastrService,
    private router: Router,
    private stripeService: StripeService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  /* ================= LOGIN ================= */

submit() {

  if (this.loginForm.invalid) return;

  this.loading = true;

  this.api.login(this.loginForm.value).subscribe({

    next: (res) => {

      // normal success (active users)

      localStorage.setItem('token', res.token);
      localStorage.setItem('userId', res.id);
      localStorage.setItem('subscriptionStatus', res.subscriptionStatus);
      localStorage.setItem('tokens', String(res.tokens));

      this.auth.login(res.token);

      this.toast.success('Login success');
      this.router.navigate(['/dashboard']);

      this.loading = false;
    },

    error: async (e) => {

      const err = e.error;

      /* ================= PAYMENT REQUIRED ================= */

      if (err?.subscriptionStatus === 'inactive' && err?.token) {

        // save token even on error
        localStorage.setItem('token', err.token);
        localStorage.setItem('subscriptionStatus', err.subscriptionStatus);

        this.auth.login(err.token);

        this.toast.info('Complete your subscription');

        this.loginForm.disable();

        this.showCheckout = true;

        await this.openCheckout();   // ✅ OPEN STRIPE

        this.loading = false;
        return;
      }

      /* ================= NORMAL ERROR ================= */

      this.toast.error(err?.message || 'Login failed');
      this.loading = false;
    }
  });
}

  /* ================= STRIPE CHECKOUT ================= */

  async openCheckout() {

    if (this.loadingCheckout) return;

    this.loadingCheckout = true;

    // destroy old checkout if exists
    if (this.checkoutInstance) {
      this.checkoutInstance.destroy();
      this.checkoutInstance = null;
    }

    try {
      this.stripe = await loadStripe(environment.stripePublishableKey);

      this.stripeService.createSubscription().subscribe({

        next: async (res: any) => {

          try {

            const checkout = await this.stripe.initEmbeddedCheckout({
              clientSecret: res.clientSecret
            });

            this.checkoutInstance = checkout;

            checkout.mount('#login-checkout');

          } catch (err) {
            console.error('Stripe init error:', err);
            this.toast.error('Payment initialization failed');
          }

          this.loadingCheckout = false;
        },

        error: () => {
          this.loadingCheckout = false;
          this.toast.error('Unable to start payment');
        }
      });

    } catch (err) {
      console.error('Stripe load error:', err);
      this.loadingCheckout = false;
      this.toast.error('Stripe failed to load');
    }
  }

  /* ================= CLEANUP ================= */

  ngOnDestroy() {
    if (this.checkoutInstance) {
      this.checkoutInstance.destroy();
      this.checkoutInstance = null;
    }
  }
}