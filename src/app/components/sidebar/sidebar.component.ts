import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth-service.service';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {

  sidebarOpen = false;
  accountOpen = false;

  isLoggedIn$!: Observable<boolean>;
  isActive$!: Observable<boolean>;
  isInactive$!: Observable<boolean>;

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.isLoggedIn$ = this.auth.isLoggedIn$;

    this.isActive$ = this.auth.subscriptionStatus$.pipe(
      map(status => status === 'active')
    );

    this.isInactive$ = this.auth.subscriptionStatus$.pipe(
      map(status => status !== 'active')
    );
  }

  toggleAccount() {
    this.accountOpen = !this.accountOpen;
  }

  onNavigate() {
    this.sidebarOpen = false;
    this.accountOpen = false;
  }

  logout() {
    this.auth.logout();
    localStorage.removeItem('subscriptionStatus');
    this.onNavigate();
    this.router.navigate(['/']);
  }
}