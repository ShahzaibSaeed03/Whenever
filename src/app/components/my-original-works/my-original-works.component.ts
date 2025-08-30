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
  loading: boolean = false;

  // 🔹 Modal states
  showPasswordModal: boolean = false;
  sharePassword: string = '';
  showPassword: boolean = false;
  selectedWorkId: string = '';

  constructor(
    private workService: WorkService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.isLoggedIn = false;
      this.toastr.warning('Please login first to see your work.');
    } else {
      this.isLoggedIn = true;
      this.getallworkDetails(userId);
    }
  }

  getallworkDetails(userId: string) {
    this.loading = true;
    this.workService.getWorkById(userId).subscribe(
      (res: any) => {
        this.data = res.data;
        this.loading = false;
      },
      () => {
        this.toastr.error('Failed to fetch your works.');
        this.loading = false;
      }
    );
  }

  // 🔹 When clicking Share
  shareWork(workId: any): void {
    if (!this.isLoggedIn) {
      this.toastr.warning('Please login first to share your work.');
      this.router.navigate(['/login']);
      return;
    }
    this.selectedWorkId = workId;
    this.showPasswordModal = true;
  }

  // 🔹 Close modal
  closeModal() {
    this.showPasswordModal = false;
    this.sharePassword = '';
    this.showPassword = false;
  }

  // 🔹 Toggle password view
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // 🔹 Generate Share Link with password
  generateShareLink() {
    if (this.sharePassword.length !== 6) {
      this.toastr.error('Password must be exactly 6 characters.');
      return;
    }

    this.workService.shareWork(this.selectedWorkId, this.sharePassword).subscribe(
      (response) => {
        this.workIdFromParent = response.shareUrl.split('/').pop()!;
        const shareLink = `https://mycopyrightally.com/view-work/${this.workIdFromParent}`;
        navigator.clipboard.writeText(shareLink)
          .then(() => this.toastr.success('Work link copied to clipboard!'))
          .catch(() => this.toastr.error('Failed to copy link.'));

        this.closeModal();
      },
      () => this.toastr.error('Failed to share work. Please try again.')
    );
  }
}
