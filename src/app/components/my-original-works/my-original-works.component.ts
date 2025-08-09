import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PasswordModalComponent } from '../password-modal/password-modal.component';
import { FormsModule } from '@angular/forms';
import { Work, WorkService } from '../../service/work-service.service';

@Component({
  selector: 'app-my-original-works',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-original-works.component.html',
})
export class MyOriginalWorksComponent implements OnInit {
  works: Work[] = [];
  data:any[]=[]
  
  showPasswordModal = false;
  selectedWorkTitle = '';
  selectedWorkId: number | null = null;

  constructor(private workService: WorkService) {}

  ngOnInit(): void {
 this.getallworkDetails()
  }
getallworkDetails() {
  // Retrieve userId from localStorage
  const userId = localStorage.getItem('userId'); // Ensure that 'userId' is saved in localStorage

  // Check if userId exists in localStorage
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
 // Method to share the work by passing the work ID
  shareWork(workId: number) {
    console.log('Sharing work with ID:', workId);  // Log for debugging
    this.workService.shareWork(workId).subscribe(
      (response) => {
        console.log('Work shared successfully', response);
        alert('Work shared successfully!');
      },
      (error) => {
        console.error('Error sharing work', error);
        alert('Failed to share work. Please try again.');
      }
    );
  }

}
