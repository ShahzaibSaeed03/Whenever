import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { AuthApiService } from '../../service/auth-api.service';
import { Router } from '@angular/router';
@Component({
  standalone: true,
  selector: 'app-register-user',
  imports: [CommonModule, ReactiveFormsModule, ToastrModule],
  templateUrl: './register-user.component.html'
})
export class RegisterUserComponent implements OnInit {

  showPassword = false;
  form!: FormGroup;   // 👈 declare only

  constructor(
    private fb: FormBuilder,
    private api: AuthApiService,
    private toast: ToastrService,
      private router: Router

  ) {}

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

  if(country === 'USA'){
    state?.setValidators([Validators.required]);
  }else{
    state?.clearValidators();
  }

  state?.updateValueAndValidity();
});

/* BILLING COUNTRY */
this.form.get('billingCountry')?.valueChanges.subscribe(country => {

  const state = this.form.get('billingState');

  if(country === 'USA'){
    state?.setValidators([Validators.required]);
  }else{
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
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming'
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

    next: () => {

      this.toast.success('Registered successfully');

      /* CLEAR FORM */
      this.form.reset();

      /* OPTIONAL default checkbox false */
      this.form.patchValue({ billingSameAsPersonal: false });

      /* NAVIGATE LOGIN */
      this.router.navigate(['/login']);
    },

    error: e => this.toast.error(e.error?.message || 'Error')
  });
}
}