import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkService } from '../../service/work-service.service';
import { CommonModule } from '@angular/common';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  selector: 'app-register-user',
  imports: [CommonModule, ReactiveFormsModule, ToastrModule],
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css']
})
export class RegisterUserComponent {
  registerForm: FormGroup;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private authService: WorkService,
    private _toastr: ToastrService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.authService.register(this.registerForm.value).subscribe(
      (res: any) => {
        if (res.status === 400) {
          this._toastr.error('User already exists');
        } else {
          this._toastr.success('User registered successfully');
          this.router.navigateByUrl('/login');
        }
      },
      (error) => {
        console.error('Registration error:', error);
        this._toastr.error('Something went wrong. Please try again.');
      }
    );
  }
}
