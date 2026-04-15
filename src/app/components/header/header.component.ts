import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth-service.service';
import { AuthApiService } from '../../service/auth-api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  user: any = null;

constructor(
  public auth: AuthService,
  private api: AuthApiService,
  private router: Router,
  private cdr: ChangeDetectorRef
) {}

ngOnInit() {
  this.auth.isLoggedIn$.subscribe((loggedIn) => {
    const pending = localStorage.getItem('pending_payment');

    if (loggedIn && pending !== 'true') {
      this.loadProfile();
    }
  });
}
isPendingPayment(): boolean {
  return localStorage.getItem('pending_payment') === 'true';
}
loadProfile() {
  this.api.getProfile().subscribe({
    next: (res: any) => {
      this.user = res;

      // 🔥 force UI update
      this.cdr.detectChanges();
    }
  });
}
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
