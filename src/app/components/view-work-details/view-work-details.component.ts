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

  constructor(
    private workService: WorkService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get workId from route params
    const workId = this.route.snapshot.paramMap.get('workId');
    if (workId) {
      this.fetchWorkData(workId);
    } else {
      this.errorMessage = 'Work ID not provided!';
    }
  }

  fetchWorkData(workId: any): void {
    this.workService.getWorkByIds(workId).subscribe(
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
        console.error(error);
      }
    );
  }
}
