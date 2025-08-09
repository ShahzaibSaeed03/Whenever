import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkService } from '../../service/work-service.service';
import { ToastrModule,ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,ToastrModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMsg = '';

  constructor(private fb: FormBuilder, private authService: WorkService,private _toastrS:ToastrService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

onSubmit() {
  if (this.loginForm.invalid) return;

  this.authService.login(this.loginForm.value).subscribe(
    (res: any) => {
      console.log('Full Login Response:', res); // See full response in console

      const token = res.token;
      const userId = res.id;

      if (token && userId) {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId); // ✅ Store ID here
        this._toastrS.success('User Login');
        this.router.navigateByUrl('/upload');
      } else {
        this._toastrS.error('Login failed: token or ID missing');
        console.warn('Login Response missing token or ID:', res);
      }
    },
    (error) => {
      console.error('Login Error:', error);
      this._toastrS.error('Login failed. Please try again.');
    }
  );
}


}
