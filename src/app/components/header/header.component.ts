import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth-service.service';
import { AuthApiService } from '../../service/auth-api.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  user: any = null;

  constructor(
    public auth: AuthService,
    private api: AuthApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

 ngOnInit(): void {

  this.auth.checkLogin();

  // 🔥 listen to global user changes
  this.auth.user$.subscribe(user => {
    this.user = user;
  });

  // load profile if not loaded
  this.auth.isLoggedIn$.subscribe((loggedIn) => {
    if (loggedIn && !this.user) {
      this.loadProfile();
    }
  });
}

loadProfile() {
  this.api.getProfile().subscribe({
    next: (res: any) => {
      this.auth.setUser(res); // 🔥 update global user
    }
  });
}

 

  logout(): void {
    this.auth.logout();
    this.user = null;
    this.router.navigate(['/login']);
  }
}