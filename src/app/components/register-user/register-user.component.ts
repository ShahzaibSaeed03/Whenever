import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { AuthApiService } from '../../service/auth-api.service';
import { Router } from '@angular/router';
import { StripeService } from '../../service/stripe.service';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environment/environment';
@Component({
  standalone: true,
  selector: 'app-register-user',
  imports: [CommonModule, ReactiveFormsModule, ToastrModule],
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

      addressLine1: [''],
      addressLine2: [''],
      zip: [''],
      city: [''],
      state: [''],
      country: [''],
      phone: [''],
      profession: [''],
      refSource: [''],

      billingSameAsPersonal: [false],

      billingCompany: [''],
      billingName: [''],
      vatNumber: [''],
      billingAddress1: [''],
      billingAddress2: [''],
      billingZip: [''],
      billingCity: [''],
      billingState: [''],
      billingCountry: [''],
      billingPhone: ['']
    });
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

    if (this.form.invalid) return;

    if (!this.form.value.companyName && !this.form.value.ownerName) {
      this.toast.error('Company or Owner required');
      return;
    }

    if (this.form.value.email !== this.form.value.confirmEmail) {
      this.toast.error('Emails do not match');
      return;
    }

    const payload: any = { ...this.form.value };
    delete payload.confirmEmail;

    this.api.register(payload).subscribe({

      next: (res: any) => {

        /* ⭐ SAVE TOKEN */
        localStorage.setItem('token', res.token);

        this.toast.success('Registered');

        this.form.reset();

        /* ⭐ OPEN STRIPE */
        this.openCheckout();
      },

      error: e => this.toast.error(e.error?.message || 'Error')
    });
  }
  async openCheckout() {

    if (this.loading) return;
    this.loading = true;
    this.showCheckout = true;

    this.stripe = await loadStripe(environment.stripePublishableKey);

    this.stripeService.createSubscription().subscribe(async (res: any) => {

      const checkout = await this.stripe.initEmbeddedCheckout({
        clientSecret: res.clientSecret
      });

      this.checkoutInstance = checkout;
      checkout.mount('#subscription-checkout');

      this.loading = false;
    });
  }
  closeCheckout() {
    if (this.checkoutInstance) {
      this.checkoutInstance.destroy();
      this.checkoutInstance = null;
    }
    this.showCheckout = false;
  }
}