import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth-service.service';
import { AuthApiService } from '../../service/auth-api.service';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  user: any = null;

  isLoggedIn$!: Observable<boolean>;
  isActive$!: Observable<boolean>;
  isInactive$!: Observable<boolean>;

  constructor(
    public auth: AuthService,
    private api: AuthApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {

    this.isLoggedIn$ = this.auth.isLoggedIn$;

    this.isActive$ = this.auth.subscriptionStatus$.pipe(
      map(status => status === 'active')
    );

    this.isInactive$ = this.auth.subscriptionStatus$.pipe(
      map(status => status !== 'active')
    );

    // 🔥 IMPORTANT FIX
    this.auth.subscriptionStatus$.subscribe((status) => {

      if (status === 'active') {
        this.loadProfile();   // ✅ always call after payment
      }

    });
  }

  loadProfile() {
    this.api.getProfile().subscribe({
      next: (res: any) => {
        this.user = res;
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.auth.logout();
    localStorage.removeItem('subscriptionStatus');
    this.router.navigate(['/login']);
  }
}