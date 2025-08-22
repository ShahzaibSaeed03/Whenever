import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { WorkService } from '../../service/work-service.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastrModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMsg = '';
  loading = false;  // ✅ loading state

  constructor(
    private fb: FormBuilder,
    private authService: WorkService,
    private _toastrS: ToastrService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true; // ✅ start spinner

    this.authService.login(this.loginForm.value).subscribe(
      (res: any) => {
        this.loading = false; // ✅ stop spinner


        const token = res.token;
        const userId = res.id;

        if (token && userId) {
          localStorage.setItem('token', token);
          localStorage.setItem('userId', userId);
          this._toastrS.success('User Login');
          this.router.navigateByUrl('/upload');
        } else {
          this._toastrS.error('Login failed: token or ID missing');
          console.warn('Login Response missing token or ID:', res);
        }
      },
      (error) => {
        this.loading = false; // ✅ stop spinner
        console.error('Login Error:', error);
        this._toastrS.error('Login failed. Please try again.');
      }
    );
  }
}
