import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  menuOpen = false;
  isLoggedIn = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkLogin();
  }

  checkLogin() {
    this.isLoggedIn = !!localStorage.getItem('token'); // true if token exists
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.router.navigateByUrl('/login');
  }
}
