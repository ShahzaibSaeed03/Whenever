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
  fileName: string = '';

  constructor(
    private workS: WorkService,
    private toast: ToastrService
  ) { }
  onFileChange(event: any) {
    this.errorMessage = '';
    this.showError = false;
    const file: File = event.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const sizeMB = file.size / (1024 * 1024);

    // File size check
    if (sizeMB > 120) {
      this.errorMessage = `The size of your file is ${Math.round(sizeMB * 100) / 100} MB.
This exceeds our file size limit of 120 MB.
Please compress your file before retrying.`;
      this.showError = true;
      return;
    }

    // File type check
    // if (ext === 'exe' || ext === 'js') {
    //   this.errorMessage = `We don’t accept .exe or javascript files`;
    //   this.showError = true;
    //   return;
    // }

    // Passed all checks
    this.selectedFile = file;
    this.fileName = file.name; // <-- Update the text input
  }

  upload() {
    this.errorMessage = '';
    this.showError = false;

    if (!this.selectedFile || !this.workTitle || !this.copyrightOwner) {
      this.errorMessage = 'Please complete all fields before uploading.';
      this.showError = true;
      return;
    }

    this.isUploading = true;

    this.workS.uploadFile(
      this.selectedFile,
      this.workTitle,
      this.additionalOwners,
      this.copyrightOwner
    ).subscribe(
      (res: any) => {

        this.isUploading = false;

        if (res && res.status === 'success') {
          this.uploadedData = res.data;

          // Add user input values for display
          this.uploadedData.fileName = this.selectedFile?.name || '';
          this.uploadedData.copyrightOwner = this.copyrightOwner;
          this.uploadedData.additionalOwners = this.additionalOwners;

          this.workupload = true;

          // Reset fields
          this.selectedFile = null;
          this.workTitle = '';
          this.additionalOwners = '';
          this.copyrightOwner = '';
          if (this.uploadedData.certificate_url) {
            const fileName = `Certificate_${this.uploadedData.displayed_id}.pdf`;
            this.triggerDownload(this.uploadedData.certificate_url, fileName);
          }

          if (this.uploadedData.ots_url) {
               const fileName = `timestamp_${this.uploadedData.displayed_id}.ots`;

            this.triggerDownload(this.uploadedData.ots_url, fileName);
          }


        } else {
          this.errorMessage = res?.error || 'Oops! Something went wrong while uploading your work.';
          this.showError = true;
        }
      },
      (error: any) => {
        this.isUploading = false;

        let backendMsg = error?.error?.message || error?.error?.error || error?.message;

        if (backendMsg) {
          // Map specific backend message to friendly text
          if (backendMsg.includes('.exe') || backendMsg.includes('.js')) {
            this.errorMessage = "We don’t accept .exe or javascript files";
          } else {
            this.errorMessage = backendMsg; // fallback to original backend message
          }
        } else {
          this.errorMessage = "Oops! Something went wrong while uploading your work.";
        }

        this.showError = true;
        console.error('Upload failed:', error);
      }


    );
  }
  triggerDownload(url: string, filename: string) {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl); // cleanup
      })
      .catch(err => console.error("Download failed:", err));
  }



  // Close error modal
  closeError() {
    this.showError = false;
    this.errorMessage = '';

    // Clear form fields
    this.selectedFile = null;
    this.workTitle = '';
    this.additionalOwners = '';
    this.copyrightOwner = '';
    this.fileName = ''; // if you are showing chosen file name in input
  }





  closeDetailbox() {
    this.workupload = false;
    this.uploadedData = null;
    this.selectedFile = null;
    this.errorMessage = '';
  }
}
