import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkService } from '../../service/work-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-work-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './view-work-details.component.html',
  styleUrls: ['./view-work-details.component.css']
})
export class ViewWorkDetailsComponent implements OnInit {
  workData: any = null;
  errorMessage: string = '';
  successMessage: string = '';

  // Password modal
  showPasswordModal: boolean = true;   // ✅ always open on page load
  enteredPassword: string = '';
  showPassword: boolean = false;
  workId: string | null = null;
  loading: boolean = false;

  constructor(
    private workService: WorkService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.workId = this.route.snapshot.paramMap.get('workId');
    if (!this.workId) {
      this.errorMessage = 'Work ID not provided!';
      // ❌ do NOT close modal here, user still needs to see error
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  submitPassword() {
    if (!this.workId) return;

    if (this.enteredPassword.length !== 6) {
      this.errorMessage = 'Password must be 6 characters.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.workService.getWorkByIds(this.workId, this.enteredPassword).subscribe(
      (response) => {
        this.loading = false;

        if (response.success) {
          this.workData = response.data;
          this.successMessage = 'Access granted!';
          this.showPasswordModal = false;   // ✅ close modal only after success
        } else {
          this.errorMessage = response.message || 'Invalid password!';
        }
      },
      (error) => {
        this.loading = false;
        this.errorMessage = 'Invalid password or failed to fetch work.';
      }
    );
  }
}
