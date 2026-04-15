import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../service/auth-service.service';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  sidebarOpen = false;
  accountOpen = false;
  constructor(public auth: AuthService, private router: Router) { } toggleAccount() {
    this.accountOpen = !this.accountOpen;
  }

  onNavigate() {
    this.sidebarOpen = false;
    this.accountOpen = false;
  }
  logout(){
  this.auth.logout();

  this.onNavigate();

  this.router.navigate(['/']);   // redirect page
}
}
