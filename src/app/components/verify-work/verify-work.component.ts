import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { WorkService } from '../../service/work-service.service';

@Component({
  selector: 'app-verify-work',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-work.component.html',
  styleUrls: ['./verify-work.component.css'],
})
export class VerifyWorkComponent implements OnInit {

  file: File | null = null;
  certificate: File | null = null;
  otsFile: File | null = null;

  fileName = '';
  certificateName = '';
  otsFileName = '';
  isTokenLoaded = false;

  tokens = 0;
  billingDate = '';

  errorMessage: string | null = null;
  successMessage: string | null = null;

  backendResponse: any = null;

  isVerifying = false;

  constructor(
    private workService: WorkService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {

    this.workService.getTokenDetails()
      .subscribe((res: any) => {
        this.tokens = res.remainingTokens;
        this.billingDate = res.nextBillingDate;
        this.isTokenLoaded = true; // ✅ mark loaded
      });

  }

  /* ---------------- FILE SELECT ---------------- */

  onFileChange(event: Event, type: 'file' | 'certificate' | 'otsFile') {

    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const selectedFile = input.files[0];

    if (type === 'file') {
      this.file = selectedFile;
      this.fileName = selectedFile.name;
    }

    if (type === 'certificate') {
      this.certificate = selectedFile;
      this.certificateName = selectedFile.name;
    }

    if (type === 'otsFile') {
      this.otsFile = selectedFile;
      this.otsFileName = selectedFile.name;
    }

  }

  /* ---------------- VERIFY ---------------- */

  verify() {

    this.resetStatus();

    if (!this.file || !this.certificate || !this.otsFile) {
      this.setError('Please select the original file, certificate and .ots file.');
      return;
    }

    this.isVerifying = true;

    const formData = new FormData();
    formData.append('originalFile', this.file);
    formData.append('certificate', this.certificate);
    formData.append('ots', this.otsFile);

    this.workService.verifyWork(formData).subscribe({

      next: (res: any) => {

        this.isVerifying = false;
        this.backendResponse = res;

        if (!res?.otsStatus) {
          this.setError('Unexpected response from server.');
          return;
        }

const status = res.otsStatus.status;
const raw = (res.otsStatus.raw || '').toLowerCase();
/* -------- VERIFIED (Bitcoin anchored) -------- */
if (status === 'verified') {

  const block = res.otsStatus.blockHeight || 'N/A';

  const utcDate = res.otsStatus.blockTime
    ? new Date(res.otsStatus.blockTime).toUTCString()
    : 'N/A';

  this.successMessage =
    `🔒 Proof Verified on Bitcoin Blockchain

Your file is permanently anchored and tamper-proof.

📦 Bitcoin Block: ${block}
🕒 Time (UTC): ${utcDate}`;
}


/* -------- MATCHED (Proof OK but NOT anchored) -------- */
else if (status === 'matched') {

  this.successMessage =
    `✅ File Verified Successfully

The file matches the timestamp proof.

⚠️ Not yet anchored on Bitcoin blockchain.
⏳ This usually takes 2–24 hours.

Please check again later.`;
}


/* -------- PENDING (Still processing by calendars) -------- */
/* -------- VERIFIED -------- */
if (status === 'verified' && res.otsStatus.blockHeight) {

  const block = res.otsStatus.blockHeight;

  const utcDate = res.otsStatus.blockTime
    ? new Date(res.otsStatus.blockTime).toUTCString()
    : 'N/A';

  this.successMessage =
    `🔒 Proof Verified on Bitcoin Blockchain

📦 Block: ${block}
🕒 Time (UTC): ${utcDate}`;
}else if (status === 'verified' && !res.otsStatus.blockHeight) {

  this.successMessage =
    `⏳ Timestamp Pending

The proof is created but not yet confirmed on Bitcoin.

⏱ Takes 2–24 hours.
🔄 Please try again later.`;
}


/* -------- MATCHED -------- */
else if (status === 'matched') {

  this.successMessage =
    `✅ File Verified Successfully

File matches the proof but not yet anchored on Bitcoin.

⏳ Takes 2–24 hours. Try again later.`;
}


/* -------- FORCE PENDING (RAW DETECTION) -------- */
else if (
  status === 'pending' ||
  raw.includes('pending confirmation in bitcoin') ||
  raw.includes('calendar')
) {

  this.successMessage =
    `⏳ Timestamp Pending

Your proof is submitted to Bitcoin calendars but not yet confirmed.

⏱ Expected time: 2–24 hours
🔄 Please try again later.`;
}


/* -------- ERROR -------- */
else {

  this.setError(res.otsStatus.message || 'Verification failed.');

}




      },

      error: (err) => {

        this.isVerifying = false;

        this.setError(
          err?.error?.message ||
          err?.message ||
          'Verification failed. Please try again.'
        );

      }

    });

  }

  /* ---------------- ERROR HANDLER ---------------- */

  private setError(msg: string) {

    this.errorMessage = msg;
    this.successMessage = null;

    this.toastr.error(msg);

  }

  /* ---------------- RESET ---------------- */

  private resetStatus() {

    this.errorMessage = null;
    this.successMessage = null;
    this.backendResponse = null;

  }

}