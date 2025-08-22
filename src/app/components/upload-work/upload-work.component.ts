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
showError = false;

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

  if (sizeMB > 120) {
    this.errorMessage = `The size of your file is ${Math.round(sizeMB * 100) / 100} MB.
This exceeds our file size limit of 120 MB.
Please compress your file before retrying.`;
    this.showError = true;
    return;
  }

  if (ext === 'exe' || ext === 'js') {
    this.errorMessage = `We don’t accept .exe or javascript files`;
    this.showError = true;
    return;
  }

  this.selectedFile = file;
}

upload() {
  this.errorMessage = '';
  this.showError = false;

  if (!this.selectedFile || !this.workTitle || !this.additionalOwners || !this.copyrightOwner) {
    this.errorMessage = 'Please complete all fields before uploading.';
    this.showError = true;
    return;
  }

  this.isUploading = true;

  this.workS.uploadFile(this.selectedFile, this.workTitle, this.additionalOwners, this.copyrightOwner)
    .subscribe(
      (res: any) => {
        this.isUploading = false;

        if (res && res.status === 'success') {
          this.uploadedData = res.data;
          this.workupload = true;

          // Reset fields
          this.selectedFile = null;
          this.workTitle = '';
          this.additionalOwners = '';
          this.copyrightOwner = '';
        } else {
          this.errorMessage = 'Oops! Something went wrong while uploading your work. Please try again later.';
          this.showError = true;
          console.error('Upload error response:', res); // log full response for debugging
        }
      },
      (error) => {
        this.isUploading = false;
        this.errorMessage = 'Oops! Something went wrong while uploading your work. Please try again later.';
        this.showError = true;
        console.error('Upload failed:', error); // log real error in console
      }
    );
}


// Close error modal
closeError() {
  this.showError = false;
  this.errorMessage = '';
}




  closeDetailbox() {
    this.workupload = false;
    this.uploadedData = null;
    this.selectedFile = null;
    this.errorMessage = '';
  }
}
