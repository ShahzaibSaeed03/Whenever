import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AuthApiService } from '../../service/auth-api.service';
import { AuthService } from '../../service/auth-service.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastrModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  showPassword = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private api: AuthApiService,
    private auth: AuthService,
    private toast: ToastrService,
    private router: Router
  ) { }

  ngOnInit() {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  submit() {

    if (this.loginForm.invalid) return;

    this.loading = true;

    this.api.login(this.loginForm.value).subscribe({

 next: (res) => {

  localStorage.setItem('token', res.token);
  localStorage.setItem('userId', res.id);
  localStorage.setItem('subscriptionStatus', res.subscriptionStatus);
  localStorage.setItem('tokens', String(res.tokens));

  this.auth.login(res.token);

  this.toast.success('Login success');
  this.router.navigate(['/dashboard']);

  this.loading = false;
},

      error: e => {
        this.toast.error(e.error?.message || 'Login failed');
        this.loading = false;
      }
    });
  }
}