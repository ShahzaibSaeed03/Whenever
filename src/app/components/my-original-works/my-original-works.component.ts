import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { Work, WorkService } from '../../service/work-service.service';

@Component({
  selector: 'app-my-original-works',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-original-works.component.html',
})
export class MyOriginalWorksComponent implements OnInit {
  works: Work[] = [];
  data: any[] = [];
  workIdFromParent: string = ''; 
  isLoggedIn: boolean = false;

  constructor(
    private workService: WorkService,
    private router: Router,
    private toastr: ToastrService   // ✅ inject Toastr
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.isLoggedIn = false;
      this.toastr.warning('Please login first to see your work.');
      console.warn('User not logged in');
    } else {
      this.isLoggedIn = true;
      this.getallworkDetails(userId);
    }
  }

  getallworkDetails(userId: string) {
    this.workService.getWorkById(userId).subscribe(
      (res: any) => {
        console.log('Work details fetched successfully:', res);
        this.data = res.data;
      },
      (error) => {
        console.error('Error fetching work details', error);
        this.toastr.error('Failed to fetch your works.');
      }
    );
  }

  shareWork(workId: any): void {
    if (!this.isLoggedIn) {
      this.toastr.warning('Please login first to share your work.');
      this.router.navigate(['/login']);
      return;
    }

    this.workService.shareWork(workId).subscribe(
      (response) => {
        this.workIdFromParent = response.shareUrl.split('/').pop()!;
        const shareLink = `https://mycopyrightally.com/view-work/${this.workIdFromParent}`;
        navigator.clipboard.writeText(shareLink)
          .then(() => {
            this.toastr.success('Work link copied to clipboard!');
          })
          .catch((err) => {
            console.error('Error copying link to clipboard:', err);
            this.toastr.error('Failed to copy link to clipboard.');
          });

        // this.router.navigate([`/view-work/${this.workIdFromParent}`]);
      },
      (error) => {
        console.error('Error sharing work:', error);
        this.toastr.error('Failed to share work. Please try again.');
      }
    );
  }
}
