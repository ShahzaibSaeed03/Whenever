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

  constructor(private workS: WorkService, private toast: ToastrService) { }

  onFileChange(event: any) {
    const fileInput = event.target as HTMLInputElement;
    const file: File | null = fileInput.files?.[0] || null;

    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const sizeMB = file.size / (1024 * 1024);

    // File size check
    if (sizeMB > 120) {
      this.setError(
        `The size of your file is ${sizeMB.toFixed(2)} MB. This exceeds our limit of 120 MB. Please compress your file and try again.`
      );
      fileInput.value = ''; // ✅ reset input so same file can trigger again
      return;
    }

    // File type restriction
    if (ext === 'exe' || ext === 'js') {
      this.setError(`We don’t accept .exe or .js files`);
      fileInput.value = ''; // ✅ reset input here too
      return;
    }

    // valid file
    this.resetError();
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
          console.log(res)
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

  private async handleUploadSuccess(data: any) {
    this.uploadedData = {
      ...data,
      fileName: this.selectedFile?.name || '',
      copyrightOwner: this.copyrightOwner,
      additionalOwners: this.additionalOwners
    };

    this.workupload = true;

    try {
      // 1. Download certificate first
      if (this.uploadedData.certificate_url) {
        await this.triggerDownloadWithDelay(this.uploadedData.certificate_url, 0); // no delay for cert
      }

      // 2. Download OTS after 2s delay
      if (this.uploadedData.ots_url) {
        await this.triggerDownloadWithDelay(this.uploadedData.ots_url, 2000);
      }
    } catch (err) {
      console.error("Download sequence failed", err);
      this.setError("Failed to download files.");
    }

    this.resetFormFields();
  }

  private triggerDownloadWithDelay(url: string, delay: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const link = document.createElement('a');
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          resolve();
        } catch (err) {
          reject(err);
        }
      }, delay);
    });
  }


  private triggerSequentialDownload(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const link = document.createElement('a');
        link.href = url;
        // ensures browser handles it better
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => resolve(), 1000); // wait a bit before next download
      } catch (err) {
        reject(err);
      }
    });
  }








  closeError() {
    this.showError = false;
    this.resetError();
    this.resetFormFields();
  }

  closeDetailbox() {
    this.resetAll();
    this.workupload = false;
    this.selectedFile = null;
    this.errorMessage = '';
    this.fileName = '';
  }

  private setError(msg: string) {
    // Reset first to force change detection
    this.errorMessage = '';
    this.showError = false;

    setTimeout(() => {
      this.errorMessage = msg;
      this.showError = true;
    });
  }


  private resetError() {
    this.errorMessage = '';
    this.showError = false;
  }

  private resetFormFields() {
    this.selectedFile = null;
   
    this.fileName = '';
  }
  private resetAll() {
      this.workTitle = '';
     this.copyrightOwner = '';
     this.additionalOwners = '';
     this.selectedFile = null;
   
    this.fileName = '';
  }
}
