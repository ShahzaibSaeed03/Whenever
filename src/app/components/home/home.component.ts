import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as AOS from 'aos';
import { LoginPromptComponent } from '../login-prompt/login-prompt.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, LoginPromptComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  showLoginModal = false;

  ngOnInit(): void {
    AOS.init({
      duration: 900,
      easing: 'ease-in-out',
      once: false,
      delay: 200,
      offset: 120
    });

    setTimeout(() => {
      AOS.refresh();
    }, 400);

    // ⏳ Show login modal after 5s if not logged in
    if (!localStorage.getItem('userId')) {
      setTimeout(() => {
        this.showLoginModal = true;
      }, 5000);
    }
  }
}
