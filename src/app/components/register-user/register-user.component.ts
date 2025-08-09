import { Component } from '@angular/core';
import {  FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkService } from '../../service/work-service.service';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { ToastrService } from 'ngx-toastr';
@Component({
  standalone:true,
  selector: 'app-register-user',
imports:[CommonModule,ReactiveFormsModule,ToastrModule],
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.css'
})
export class RegisterUserComponent {
  registerForm: FormGroup;
  errorMsg = '';

  constructor(private fb: FormBuilder, private authService: WorkService,
    private _toastr:ToastrService,
         private router: Router) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
this.authService.register(this.registerForm.value).subscribe((res:any)=>{

  this._toastr.success('user Register ')
  this.router.navigateByUrl('/login')
   if(res.status==400){
    this._toastr.error('User already Exits')
   } 
},errror=>{

}
)
   
  }
}
