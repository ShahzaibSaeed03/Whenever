import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkService } from '../../service/work-service.service';
import { AuthService } from '../../service/auth-service.service';

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
    private authService: AuthService
  ) {}

  ngOnInit() {

    this.authService.isLoggedIn$.subscribe(status => {

      this.isLoggedIn = status;

      if (status) {
        this.loadTokenData();
      } else {
        this.tokens = 0;
        this.billingDate = '';
      }

    });
  }

  loadTokenData() {
    this.workService.getTokenDetails()
      .subscribe((res: any) => {
        this.tokens = res.remainingTokens;
        this.billingDate = res.nextBillingDate;
      });
  }
}