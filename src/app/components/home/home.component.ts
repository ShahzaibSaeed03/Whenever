import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as AOS from 'aos';

@Component({
  selector: 'app-home',
  imports: [CommonModule,RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
 ngOnInit(): void {
    AOS.init({
      duration: 900,      // animation duration
      easing: 'ease-in-out',
      once: false,        // false = animate every time element comes into view
      delay: 200,         // global delay before animations trigger
      offset: 120         // start animating before element fully in viewport
    });

    // re-initialize on navigation back to homepage
    setTimeout(() => {
      AOS.refresh();
    }, 400);  // 🔥 add delay when you revisit page
  }}
