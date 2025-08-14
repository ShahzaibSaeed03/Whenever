import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { PasswordModalComponent } from '../password-modal/password-modal.component';
import { FormsModule } from '@angular/forms';
import { Work, WorkService } from '../../service/work-service.service';
import { ViewWorkDetailsComponent } from "../view-work-details/view-work-details.component";

@Component({
  selector: 'app-my-original-works',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-original-works.component.html',
})
export class MyOriginalWorksComponent implements OnInit {
  works: Work[] = [];
  data: any[] = [];
  workIdFromParent: string = ''; 
  
  showPasswordModal = false;
  selectedWorkTitle = '';
  selectedWorkId: number | null = null;

  constructor(private workService: WorkService, private router: Router) {}

  ngOnInit(): void {
    this.getallworkDetails();
  }

  getallworkDetails() {
    const userId = localStorage.getItem('userId');

    if (userId) {
      this.workService.getWorkById(userId).subscribe((res: any) => {
        console.log('Work details fetched successfully:', res);
        this.data = res.data;
      }, (error) => {
        console.error('Error fetching work details', error);
      });
    } else {
      console.error('User ID not found in localStorage');
    }
  }

  // Method to share the work by passing the work ID
  shareWork(workId: any): void {
    console.log('Sharing work with ID:', workId);

    this.workService.shareWork(workId).subscribe(
      (response) => {
        console.log('Work shared successfully:', response);

        // Extract the new work ID from the response shareUrl
        this.workIdFromParent = response.shareUrl.split('/').pop()!;
        console.log('Work ID from Parent:', this.workIdFromParent);

        // Copy the share URL to the clipboard
        const shareLink = `https://mycopyrightally.com/api/shares/access/${this.workIdFromParent}`;
        navigator.clipboard.writeText(shareLink).then(
          () => {
            console.log('Link copied to clipboard');
            alert('Work link copied to clipboard!');
          },
          (err) => {
            console.error('Error copying link to clipboard:', err);
            alert('Failed to copy link to clipboard. Please try again.');
          }
        );

        // After sharing work, navigate to the work details page
        this.router.navigate([`/view-work/${this.workIdFromParent}`]);
      },
      (error) => {
        console.error('Error sharing work:', error);
        alert('Failed to share work. Please try again.');
      }
    );
  }
}
