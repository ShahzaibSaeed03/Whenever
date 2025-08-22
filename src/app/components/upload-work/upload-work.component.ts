import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { WorkService } from '../../service/work-service.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-upload-work',
  imports: [CommonModule, NgIf, FormsModule, RouterLink],
  templateUrl: './upload-work.component.html',
  styleUrls: ['./upload-work.component.css']
})
export class UploadWorkComponent {
  selectedFile: File | null = null;
  errorMessage = '';
  workupload = false;
  uploadedData: any = null;
    uploadedDatas: any = null;

  isUploading = false;

  // Define the properties to bind to the input fields
  workTitle: string = '';  // Binding to workTitle input
  additionalOwners: string = '';  // Binding to additionalOwners input
  copyrightOwner: string = '';  // Binding to copyrightOwner input
  owner: string = "";

  constructor(
    private workS: WorkService,
    private toast: ToastrService
  ) { }

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
    // Reset previous error
    this.errorMessage = '';

    // Validate all fields
    if (!this.selectedFile || !this.workTitle || !this.additionalOwners || !this.copyrightOwner) {
      this.errorMessage = 'Please complete all fields before uploading.';
      this.toast.error(this.errorMessage);
      return;
    }

    // Set uploading state
    this.isUploading = true;

    // Call the upload service
    this.workS.uploadFile(this.selectedFile, this.workTitle, this.additionalOwners, this.copyrightOwner)
      .subscribe(
        (res: any) => {
          this.isUploading = false;

          if (res && res.status === 'success') {
            // Save user inputs locally for display
            this.uploadedData = {
              owner: this.copyrightOwner,
              additionalOwners: this.additionalOwners,
              title: this.workTitle,
              file_name: this.selectedFile?.name,
              original_file_url: '' // If you want, can generate a blob URL here for download
            };

                this.uploadedDatas = {
              owner: this.copyrightOwner,
              additionalOwners: this.additionalOwners,
              title: this.workTitle,
              file_name: this.selectedFile?.name,
              original_file_url: '' // If you want, can generate a blob URL here for download
            };
            // Clear form fields
            this.selectedFile = null;
            this.workTitle = '';
            this.additionalOwners = '';
            this.copyrightOwner = '';
            this.uploadedData = res.data;

            this.workupload = true;
            this.toast.success('Work uploaded successfully');
          } else {
            const message = res?.message || 'Error uploading work';
            this.toast.error(message);
          }
        },
        (error) => {
          this.isUploading = false;
          this.toast.error('Error uploading work: ' + (error.message || 'Unknown'));
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
