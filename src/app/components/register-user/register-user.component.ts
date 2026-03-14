import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { AuthApiService } from '../../service/auth-api.service';
import { Router, RouterLink } from '@angular/router';
import { StripeService } from '../../service/stripe.service';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environment/environment';
@Component({
  standalone: true,
  selector: 'app-register-user',
  imports: [CommonModule, ReactiveFormsModule, ToastrModule,RouterLink],
  templateUrl: './register-user.component.html'
})
export class RegisterUserComponent implements OnInit {
  stripe: any;
  checkoutInstance: any = null;

  showCheckout = false;
  loading = false;
  showPassword = false;
  form!: FormGroup;   // 👈 declare only

  constructor(
    private fb: FormBuilder,
    private api: AuthApiService,
    private toast: ToastrService,
    private router: Router,
    private stripeService: StripeService


  ) { }

  ngOnInit() {

    this.form = this.fb.group({

      firstName: ['', Validators.required],
      lastName: ['', Validators.required],

      email: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', Validators.required],
      password: ['', Validators.required],

      companyName: [''],
      ownerName: [''],

      addressLine1: ['', Validators.required],
      addressLine2: [''],

      zip: ['', Validators.required],
      city: ['', Validators.required],
      state: [''],
      country: ['', Validators.required],

      phone: [''],
      profession: [''],
      refSource: [''],

      billingSameAsPersonal: [false],

      billingCompany: [''],
      billingName: [''],
      vatNumber: [''],

      billingAddress1: ['', Validators.required],
      billingAddress2: [''],

      billingZip: ['', Validators.required],
      billingCity: ['', Validators.required],
      billingState: [''],
      billingCountry: ['', Validators.required],

      billingPhone: ['']
    });

    /* RESTORE FORM AFTER REFRESH */

    const savedForm = localStorage.getItem('signup_form');

    if (savedForm) {
      this.form.patchValue(JSON.parse(savedForm));
    }
    /* PERSONAL COUNTRY */
    this.form.get('country')?.valueChanges.subscribe(country => {

      const state = this.form.get('state');

      if (country === 'USA') {
        state?.setValidators([Validators.required]);
      } else {
        state?.clearValidators();
      }

      state?.updateValueAndValidity();
    });

    /* BILLING COUNTRY */
    this.form.get('billingCountry')?.valueChanges.subscribe(country => {

      const state = this.form.get('billingState');

      if (country === 'USA') {
        state?.setValidators([Validators.required]);
      } else {
        state?.clearValidators();
      }

      state?.updateValueAndValidity();
    });
    /* COPY PERSONAL → BILLING */
    this.form.get('billingSameAsPersonal')?.valueChanges.subscribe(v => {
      if (!v) return;

      this.form.patchValue({
        billingAddress1: this.form.value.addressLine1,
        billingAddress2: this.form.value.addressLine2,
        billingZip: this.form.value.zip,
        billingCity: this.form.value.city,
        billingState: this.form.value.state,
        billingCountry: this.form.value.country,
        billingPhone: this.form.value.phone
      });
    });
    const pending = localStorage.getItem('pending_payment');

    if (pending === 'true' && !this.checkoutInstance) {
      setTimeout(() => {
        this.openCheckout();
      }, 300);
    }
    this.form.valueChanges.subscribe(data => {
      if (!this.form.disabled) {
        localStorage.setItem('signup_form', JSON.stringify(data));
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];
  submit() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fill all required fields');
      return;
    }

    if (!this.form.value.companyName && !this.form.value.ownerName) {
      this.toast.error('Company or Owner required');
      return;
    }

    const email = this.form.value.email.toLowerCase().trim();
    const confirmEmail = this.form.value.confirmEmail.toLowerCase().trim();

    if (email !== confirmEmail) {
      this.toast.error('Emails do not match');
      return;
    }

    const payload: any = {
      ...this.form.value,
      email: email
    };

    delete payload.confirmEmail;

    this.api.register(payload).subscribe({

      next: (res: any) => {

        localStorage.setItem('token', res.token);
        localStorage.setItem('pending_payment', 'true');
        localStorage.setItem('userId', res.id);
        localStorage.setItem('subscriptionStatus', res.subscriptionStatus);
        this.toast.success('Registered');

        this.form.disable();

        this.openCheckout();
      },

      error: e => this.toast.error(e.error?.message || 'Error')
    });
  }
  async openCheckout() {

    // prevent duplicate calls
    if (this.loading) return;

    this.loading = true;
    this.showCheckout = true;

    // destroy previous checkout if exists
    if (this.checkoutInstance) {
      this.checkoutInstance.destroy();
      this.checkoutInstance = null;
    }

    this.stripe = await loadStripe(environment.stripePublishableKey);

    this.stripeService.createSubscription().subscribe({
      next: async (res: any) => {

        try {

          const checkout = await this.stripe.initEmbeddedCheckout({
            clientSecret: res.clientSecret
          });

          this.checkoutInstance = checkout;

          checkout.mount('#subscription-checkout');

        } catch (err) {
          console.error('Stripe checkout error:', err);
        }

        this.loading = false;
      },

      error: () => {
        this.loading = false;
        this.toast.error('Unable to start checkout');
      }
    });
  }
  closeCheckout() {
    if (this.checkoutInstance) {
      this.checkoutInstance.destroy();
      this.checkoutInstance = null;
    }
    this.showCheckout = false;
  }


  ngOnDestroy() {
    if (this.checkoutInstance) {
      this.checkoutInstance.destroy();
      this.checkoutInstance = null;
    }
  }
}