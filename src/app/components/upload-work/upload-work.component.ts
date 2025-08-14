import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { WorkService } from '../../service/work-service.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload-work',
  imports: [CommonModule, NgIf,FormsModule ],
  templateUrl: './upload-work.component.html',
  styleUrls: ['./upload-work.component.css']
})
export class UploadWorkComponent {
  selectedFile: File | null = null;
  errorMessage = '';
  workupload = false;
  uploadedData: any = null;
  isUploading = false;

  // Define the properties to bind to the input fields
  workTitle: string = '';  // Binding to workTitle input
  additionalOwners: string = '';  // Binding to additionalOwners input
  copyrightOwner: string = '';  // Binding to copyrightOwner input

  constructor(
    private workS: WorkService,
    private toast: ToastrService
  ) {}

  onFileChange(event: any) {
    this.errorMessage = '';
    const file: File = event.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const sizeMB = file.size / (1024 * 1024);

    // File size limit: 120 MB
    if (sizeMB > 120) {
      this.errorMessage = `The size of your file is ${Math.round(sizeMB * 100) / 100} MB.
This exceeds our file size limit of 120 MB.
Please compress your file before retrying.`;
      return;
    }

    // Block .exe and .js
    if (ext === 'exe' || ext === 'js') {
      this.errorMessage = `We don’t accept .exe or javascript files`;
      return;
    }

    // Passed validation
    this.selectedFile = file;
  }

  upload() {
    if (!this.selectedFile || !this.workTitle || !this.additionalOwners || !this.copyrightOwner) {
      this.errorMessage = 'Please complete all fields before uploading.';
      return;
    }

    this.isUploading = true;
    this.workS.uploadedfileed(this.selectedFile, this.workTitle, this.additionalOwners, this.copyrightOwner).subscribe(
      (res: any) => {
        this.isUploading = false;
        if (res.status === 'success') {
          this.uploadedData = res.data;
          this.workupload = true;
          this.toast.success('Work uploaded successfully');
        } else {
          this.toast.error('Error uploading work');
        }
      },
      () => {
        this.isUploading = false;
        this.toast.error('Error uploading work');
      }
    );
  }

  closeDetailbox() {
    this.workupload = false;
    this.uploadedData = null;
    this.selectedFile = null;
    this.errorMessage = '';
  }
}
