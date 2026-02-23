import { Component, OnInit } from '@angular/core';
import { StripeService } from '../../service/stripe.service';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environment/environment';
import { CommonModule } from '@angular/common';
import { AuthApiService } from '../../service/auth-api.service';
import { FormsModule } from '@angular/forms';
import { WorkService } from '../../service/work-service.service';

@Component({
  selector: 'app-my-account-info',
  imports: [CommonModule, FormsModule],
  templateUrl: './my-account-info.component.html',
  styleUrl: './my-account-info.component.css',
})
export class MyAccountInfoComponent implements OnInit {

  profile: any = {
    personalAddress: {
      address1: "",
      address2: "",
      zip: "",
      city: "",
      state: "",
      country: "",
      phone: "",
      profession: "",
      refSource: ""
    },
    billing: {
      company: "",
      name: "",
      vatNumber: "",
      address1: "",
      address2: "",
      zip: "",
      city: "",
      state: "",
      country: "",
      phone: "",
      sameAsPersonal: false
    }
  };
  currentPassword = "";
  newPassword = "";
  confirmPassword = "";
  tokens = 0;
  billingDate = '';
  newEmail = "";
  emailCode = "";

  constructor(private api: AuthApiService, private workService: WorkService,) { }



  ngOnInit() {
    this.workService.getTokenDetails()
      .subscribe((res: any) => {

        this.tokens = res.remainingTokens;
        this.billingDate = res.nextBillingDate;

      });

  }

  loadProfile() {
    this.api.getProfile().subscribe(res => {
      this.profile = res;
    });
  }

  updateProfile() {
    this.api.updateProfile(this.profile).subscribe(() => {
      alert("Profile updated");
    });
  }

  changePassword() {

    if (this.newPassword !== this.confirmPassword) {
      alert("Passwords not match");
      return;
    }

    this.api.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe(() => {
      alert("Password updated");
    });
  }

  requestEmail() {
    this.api.requestEmailChange(this.newEmail).subscribe(() => {
      alert("Code sent");
    });
  }

  confirmEmail() {
    this.api.confirmEmail(this.emailCode).subscribe(() => {
      alert("Email updated");
      this.loadProfile();
    });
  }
}