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

    this.auth.isLoggedIn$.subscribe((loggedIn) => {
      if (loggedIn) {
        this.loadProfile();
      } else {
        this.user = null;
      }
    });
  }

  loadProfile(): void {
    this.api.getProfile().subscribe({
      next: (res: any) => {
        this.user = res;
        this.cdr.detectChanges();
      },
      error: () => {
        this.user = null;
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.user = null;
    this.router.navigate(['/login']);
  }
}