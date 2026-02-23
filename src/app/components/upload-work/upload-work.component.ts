import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WorkService } from '../../service/work-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-upload-work',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule,],
  templateUrl: './upload-work.component.html',
  styleUrls: ['./upload-work.component.css']
})
export class UploadWorkComponent {
  // UI / State
  selectedFile: File | null = null;
  fileName = '';
  errorMessage = '';
  showError = false;
  isUploading = false;
  workupload = false;
  tokens = 0;
  uploadedData: any = null;
  certificateImg = 'Certif.png';
  billingDate = '';

  workTitle = '';
  copyrightOwner = '';
  additionalOwners = '';
  owner = '';

  private isDownloading = false;
  private lastDownloadBatchId = 0;
  private batchDownloadedUrls = new Set<string>();

  constructor(private workS: WorkService, private toast: ToastrService) { }


  ngOnInit() {
    this.workS.getTokenDetails()
      .subscribe((res: any) => {

        this.tokens = res.remainingTokens;
        this.billingDate = res.nextBillingDate;

      });
  }

  onFileChange(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file: File | null = fileInput.files?.[0] || null;
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const sizeMB = file.size / (1024 * 1024);

    if (sizeMB > 120) {
      this.setError(
        `The size of your file is ${sizeMB.toFixed(2)} MB. This exceeds our limit of 120 MB. Please compress your file and try again.`
      );
      fileInput.value = '';
      return;
    }

    if (ext === 'exe' || ext === 'js') {
      this.setError(`We don’t accept .exe or .js files.`);
      fileInput.value = '';
      return;
    }

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
          if (res?.status === 'success') {
            this.handleUploadSuccess(res.data);
          } else {
            this.setError(res?.error || 'Oops! Something went wrong while uploading your work.');
          }

          this.workS.getTokenDetails()
            .subscribe((res: any) => {

              this.tokens = res.remainingTokens;
              this.billingDate = res.nextBillingDate;

            });
        },
        (error: any) => {
          this.isUploading = false;

          const backendMsg = error?.error?.message || error?.error?.error || error?.message;
          if (backendMsg) {
            if (backendMsg.includes('.exe') || backendMsg.includes('.js')) {
              this.setError('We don’t accept .exe or javascript files');
            } else {
              this.setError(backendMsg);
            }
          } else {
            this.setError('Oops! Something went wrong while uploading your work.');
          }
        }
      );
  }

  private async handleUploadSuccess(data: any) {
    // keep a copy of what we need from the form BEFORE clearing it
    this.uploadedData = {
      ...data,
      fileName: this.selectedFile?.name || '',
      copyrightOwner: this.copyrightOwner,
      additionalOwners: this.additionalOwners
    };

    // Show overlay
    this.workupload = true;

    // Clear form inputs now that we’ve copied data
    this.resetFormFields();

    // Start a new exclusive download batch
    const myBatchId = Date.now();
    this.lastDownloadBatchId = myBatchId;
    this.batchDownloadedUrls = new Set<string>();

    try {
      await this.startSequentialDownloads(
        myBatchId,
        this.uploadedData?.ots_url,
        this.uploadedData?.certificate_url
      );
    } catch {
      this.setError('Failed to download files.');
    }
  }

  /**
   * Runs OTS first; waits 2s; then Certificate.
   * Guarded so only the newest batch executes; older batches auto-cancel.
   */
  private async startSequentialDownloads(
    batchId: number,
    otsUrl?: string,
    certUrl?: string
  ) {
    this.isDownloading = true;
    const stillMine = () => batchId === this.lastDownloadBatchId;

    try {
      if (otsUrl && stillMine()) {
        await this.triggerDownloadOnce(batchId, otsUrl);
      }

      if (certUrl && stillMine()) {
        await this.delay(2000);
        await this.triggerDownloadOnce(batchId, certUrl);
      }
    } finally {
      if (batchId === this.lastDownloadBatchId) {
        this.isDownloading = false;
      }
    }
  }

  /**
   * Ensures a URL is downloaded at most once within the same batch.
   */
  private async triggerDownloadOnce(batchId: number, url: string): Promise<void> {
    if (batchId !== this.lastDownloadBatchId) return; // canceled by newer batch

    if (this.batchDownloadedUrls.has(url)) return; // already fired in this batch
    this.batchDownloadedUrls.add(url);

    await this.triggerDownloadHard(url);
  }

  /**
   * Single, reliable programmatic download using <a download>.
   * Avoids extra iframe/path that can cause double hits.
   */
  private triggerDownloadHard(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = '';      // hint for download
        a.rel = 'noopener';
        a.target = '_self';
        a.style.display = 'none';

        const evt = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });

        document.body.appendChild(a);
        a.dispatchEvent(evt);
        document.body.removeChild(a);

        setTimeout(() => resolve(), 200);
      } catch (e) {
        reject(e);
      }
    });
  }

  private delay(ms: number) {
    return new Promise<void>((res) => setTimeout(res, ms));
  }

  // ===== UI helpers =====

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
