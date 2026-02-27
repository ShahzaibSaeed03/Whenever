import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthApiService } from '../../service/auth-api.service';
import { WorkService } from '../../service/work-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-account-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-account-info.component.html',
  styleUrl: './my-account-info.component.css',
})
export class MyAccountInfoComponent implements OnInit {

  /* ================= PROFILE ================= */

  profile:any={
    personalAddress:{
      address1:"",
      address2:"",
      zip:"",
      city:"",
      state:"",
      country:"",
      phone:"",
      profession:"",
      refSource:""
    },
    billing:{
      company:"",
      name:"",
      vatNumber:"",
      address1:"",
      address2:"",
      zip:"",
      city:"",
      state:"",
      country:"",
      phone:"",
      sameAsPersonal:false
    }
  };

  tokens=0;
  billingDate='';

  /* ================= PASSWORD ================= */

  currentPassword="";
  newPassword="";
  confirmPassword="";

  showCurrent=false;
  showNew=false;
  showConfirm=false;

  /* ================= EMAIL ================= */

  newEmail="";
  emailCode="";

  constructor(
    private api:AuthApiService,
    private workService:WorkService,
    private toast:ToastrService
  ){}

  ngOnInit(){

    this.loadProfile();

    this.workService.getTokenDetails()
    .subscribe((res:any)=>{
      this.tokens=res.remainingTokens;
      this.billingDate=res.nextBillingDate;
    });
  }

  /* ================= HELPERS ================= */

  toggle(type:string){
    if(type==='c') this.showCurrent=!this.showCurrent;
    if(type==='n') this.showNew=!this.showNew;
    if(type==='cn') this.showConfirm=!this.showConfirm;
  }

  /* ================= PROFILE ================= */

  loadProfile(){
    this.api.getProfile().subscribe({
      next:(res:any)=>{
        this.profile=res;
      },
      error:()=>{
        this.toast.error("Failed to load profile");
      }
    });
  }

  updateProfile(){
    this.api.updateProfile(this.profile).subscribe({
      next:()=>{
        this.toast.success("Profile updated");
      },
      error:()=>{
        this.toast.error("Update failed");
      }
    });
  }

  /* ================= PASSWORD ================= */

  changePassword(){

    if(!this.newPassword || this.newPassword.length<6){
      this.toast.warning("Password min 6 characters");
      return;
    }

    if(this.newPassword!==this.confirmPassword){
      this.toast.warning("Passwords do not match");
      return;
    }

    this.api.changePassword({
      currentPassword:this.currentPassword,
      newPassword:this.newPassword
    }).subscribe({
      next:()=>{
        this.toast.success("Password updated");

        this.currentPassword="";
        this.newPassword="";
        this.confirmPassword="";
      },
      error:()=>{
        this.toast.error("Password change failed");
      }
    });
  }

  /* ================= EMAIL ================= */

  requestEmail(){

    if(!this.newEmail){
      this.toast.warning("Enter email");
      return;
    }

    this.api.requestEmailChange(this.newEmail)
    .subscribe({
      next:()=>{
        this.toast.success("Verification code sent");
      },
      error:()=>{
        this.toast.error("Failed to send code");
      }
    });
  }

  confirmEmail(){

    if(!this.emailCode){
      this.toast.warning("Enter code");
      return;
    }

    this.api.confirmEmail(this.emailCode)
    .subscribe({
      next:()=>{
        this.toast.success("Email updated");
        this.loadProfile();
      },
      error:()=>{
        this.toast.error("Invalid code");
      }
    });
  }
}