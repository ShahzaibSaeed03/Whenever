import { Component, Input, OnInit } from '@angular/core';
import { WorkService } from '../../service/work-service.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-work-details',
    imports: [CommonModule,FormsModule],

  templateUrl: './view-work-details.component.html',
  styleUrls: ['./view-work-details.component.css']
})
export class ViewWorkDetailsComponent implements OnInit {
//  @Input() workId: string = ''; 
  workData: any = null;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private workService: WorkService) {}

  ngOnInit(): void {
 
      this.fetchWorkData();  // Call fetch work data if workId is available
  
  }

  // Fetch work data from the backend API using the workId
  fetchWorkData(): void {
    this.workService.getWorkByIds().subscribe(
      (response) => {
        console.log('Work data fetched successfully:', response);
        if (response.success) {
          this.workData = response.data;
          this.successMessage = 'Work data retrieved successfully!';
        } else {
          this.errorMessage = 'Failed to retrieve work data.';
        }
      },
      (error) => {
        this.errorMessage = 'An error occurred while fetching the work data.';
      }
    );
  }}