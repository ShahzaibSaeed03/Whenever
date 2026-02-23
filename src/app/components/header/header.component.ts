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
    private router: Router

  ) { }

  ngOnInit() {

    if (localStorage.getItem('token')) {
      this.loadProfile();
    }
  }

  loadProfile() {
    this.api.getProfile().subscribe({
      next: (res: any) => {
        this.user = res;   // {firstName,lastName}
      }
    });
  }
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
