import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WorkService } from '../../service/work-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-upload-work',
  imports: [CommonModule, NgIf, FormsModule, RouterLink],
  templateUrl: './upload-work.component.html',
  styleUrls: ['./upload-work.component.css']
})
export class UploadWorkComponent {
  selectedFile: File | null = null;
  fileName: string = '';
  errorMessage: string = '';
  showError = false;
  isUploading = false;
  workupload = false;

  uploadedData: any = null;

  // Form fields
  workTitle: string = '';
  copyrightOwner: string = '';
  additionalOwners: string = '';
  owner: string = "";

  constructor(private workS: WorkService, private toast: ToastrService) {}

  onFileChange(event: any) {
    this.resetError();

    const file: File = event.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const sizeMB = file.size / (1024 * 1024);

    // File size check
    if (sizeMB > 120) {
      this.setError(
        `The size of your file is ${sizeMB.toFixed(2)} MB. This exceeds our limit of 120 MB. Please compress your file and try again.`
      );
      return;
    }

    // Optional: file type restriction
    if (ext === 'exe' || ext === 'js') {
      this.setError(`We don’t accept .exe or javascript files`);
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;
  }

  upload() {
    this.resetError();

    if (!this.selectedFile || !this.workTitle || !this.copyrightOwner) {
      this.setError('Please complete all fields before uploading.');
      return;
    }

    this.isUploading = true;

    this.workS
      .uploadFile(this.selectedFile, this.workTitle, this.additionalOwners, this.copyrightOwner)
      .subscribe(
        (res: any) => {
          this.isUploading = false;

          if (res?.status === 'success') {
            this.handleUploadSuccess(res.data);
          } else {
            this.setError(res?.error || 'Oops! Something went wrong while uploading your work.');
          }
        },
        (error: any) => {
          this.isUploading = false;

          const backendMsg = error?.error?.message || error?.error?.error || error?.message;
          if (backendMsg) {
            if (backendMsg.includes('.exe') || backendMsg.includes('.js')) {
              this.setError("We don’t accept .exe or javascript files");
            } else {
              this.setError(backendMsg);
            }
          } else {
            this.setError("Oops! Something went wrong while uploading your work.");
          }

          console.error('Upload failed:', error);
        }
      );
  }

  private handleUploadSuccess(data: any) {
    this.uploadedData = {
      ...data,
      fileName: this.selectedFile?.name || '',
      copyrightOwner: this.copyrightOwner,
      additionalOwners: this.additionalOwners
    };

    this.workupload = true;
    this.resetFormFields();

    if (this.uploadedData.certificate_url) {
      this.triggerDownload(this.uploadedData.certificate_url, `Certificate_${this.uploadedData.displayed_id}.pdf`);
    }

    if (this.uploadedData.ots_url) {
      this.triggerDownload(this.uploadedData.ots_url, `timestamp_${this.uploadedData.displayed_id}.ots`);
    }
  }

  triggerDownload(url: string, filename: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  closeError() {
    this.showError = false;
    this.resetError();
    this.resetFormFields();
  }

  closeDetailbox() {
    this.workupload = false;
    this.uploadedData = null;
    this.selectedFile = null;
    this.errorMessage = '';
    this.fileName = '';
  }

  private setError(msg: string) {
    this.errorMessage = msg;
    this.showError = true;
  }

  private resetError() {
    this.errorMessage = '';
    this.showError = false;
  }

  private resetFormFields() {
    this.selectedFile = null;
    this.workTitle = '';
    this.additionalOwners = '';
    this.copyrightOwner = '';
    this.fileName = '';
  }
}
