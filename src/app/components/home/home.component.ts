import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkService } from '../../service/work-service.service';
import { AuthService } from '../../service/auth-service.service';
import { AuthApiService } from '../../service/auth-api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  tokens = 0;
  billingDate = '';
  isLoggedIn = false;

  constructor(
    private workService: WorkService,
    private authService: AuthService,
    private authApi: AuthApiService
  ) { }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(status => {

      this.isLoggedIn = status;

      if (status) {
        this.loadTokenData();
        this.loadProfile();

      } else {
        this.tokens = 0;
        this.billingDate = '';
      }

    });
  }
  isTokenLoaded = false;
  loadTokenData() {
    this.workService.getTokenDetails()
      .subscribe((res: any) => {
        this.tokens = res.remainingTokens;
        this.billingDate = res.nextBillingDate;
        this.isTokenLoaded = true; // ✅ mark loaded
      });
  }

  user: any = null;

  loadProfile() {
    this.authApi.getProfile().subscribe({
      next: (res: any) => {
        this.user = res;
        console.log("PROFILE:", res);
      },
      error: (err) => {
        console.error("Profile error", err);
      }
    });
  }
}