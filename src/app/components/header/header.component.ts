import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth-service.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule,RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  menuOpen = false;
  isLoggedIn = false;
  showLoginPopup = false;

  constructor(private router: Router,private cdr: ChangeDetectorRef,private auth: AuthService) {}

ngOnInit() {
  this.auth.isLoggedIn$.subscribe(status => {
    this.isLoggedIn = status;
    this.cdr.detectChanges(); // ensure view updates
  });
}

  checkLogin() {
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

logout() {
  this.auth.logout(); // this updates the observable and localStorage inside the service
  this.router.navigateByUrl('/login'); // redirect
}


handleProtectedNav(route: string) {
  this.checkLogin(); // <-- remove this
  if (this.isLoggedIn) {
    this.router.navigateByUrl(route);
  } else {
    this.showLoginPopup = true;
    this.cdr.detectChanges();
  }
}



  closeLoginPopup() {
    this.showLoginPopup = false;
  }

  goToLogin() {
    this.showLoginPopup = false;
    this.router.navigateByUrl('/login');
  }
}
