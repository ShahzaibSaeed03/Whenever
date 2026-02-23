import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { WorkService } from '../../service/work-service.service';
import * as pdfjsLib from 'pdfjs-dist';


// Set the worker source path correctly
pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';

@Component({
  selector: 'app-verify-work',
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-work.component.html',
  styleUrls: ['./verify-work.component.css'],
})
export class VerifyWorkComponent {
  file: File | null = null;
  certificate: File | null = null;
  otsFile: File | null = null;

  fileName = '';
  certificateName = '';
  otsFileName = '';

  errorMessage: string | null = null;
  successMessage: string | null = null;
  tsaResult: any = null;
  backendResponse: any = null;
  blocks: any[] = [];

  isVerifying = false;

  constructor(private workService: WorkService, private toastr: ToastrService) { }

  formatUtcToDate(utcString: string): string {
    if (!utcString) return '';

    // Normalize whitespace/newlines and trim
    const s = utcString.replace(/\s+/g, ' ').trim();

    // If text like "26 August 2025 at 06:13 UTC" → take everything before " at "
    const idx = s.toLowerCase().indexOf(' at ');
    if (idx !== -1) return s.slice(0, idx).trim();

    // Fallback: try to parse and format (UTC)
    const cleaned = s.replace(/\s*UTC$/i, '');
    const d = new Date(cleaned.endsWith('Z') ? cleaned : cleaned + 'Z');
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
    }

    // Last resort: original (normalized) string
    return s;
  }

  formatUtcToAmPm(utcString: string): string {
    if (!utcString) return '';
    // Remove the " UTC" part if it exists
    const cleanString = utcString.replace(' UTC', '');
    // Create a Date object in UTC
    const date = new Date(cleanString + 'Z'); // "Z" ensures it's treated as UTC
    // Get hours, minutes, seconds
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12; // midnight or noon
    // Format numbers with leading zeros
    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');
    return `${hours}:${mm}:${ss} ${ampm} UTC`;
  }

  // Handle file selection
  onFileChange(event: Event, type: 'file' | 'certificate' | 'otsFile') {
    this.successMessage = null;

    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const selectedFile = input.files[0];

    switch (type) {
      case 'file':
        this.file = selectedFile;
        this.fileName = selectedFile.name;
        break;
      case 'certificate':
        this.certificate = selectedFile;
        this.certificateName = selectedFile.name;
        break;
      case 'otsFile':
        this.otsFile = selectedFile;
        this.otsFileName = selectedFile.name;
        break;
    }
  }

  // Main verification flow
  async verify() {
    this.resetStatus();

    if (!this.file || !this.certificate || !this.otsFile) {
      this.setError('Please first select the file to be verified, its certificate and its .ots file.');
      return;
    }

    this.isVerifying = true;

    try {
      // Optional: calculate file fingerprint if needed
      const fileFingerprint = await this.calculateSHA256(this.file);
      const certFingerprint = await this.extractFingerprintFromPDF(this.certificate);

      const formData = new FormData();
      formData.append('originalFile', this.file);
      formData.append('certificate', this.certificate);
      formData.append('ots', this.otsFile);


      this.workService.verifyWork(formData).subscribe(
        (res: any) => {
          console.log('✅ Backend Response:', res); // <-- log success response
          this.handleSuccess(res);
        },
        (error) => {
          console.error('❌ Backend Error:', error); // <-- log error response
          this.handleError(error);
        }
      );


    } catch (err) {
      this.setError('Error reading files. Please try again.');
      this.isVerifying = false;
    }
  }
  // 🔧 NEW: normalize backend error strings
  private prettifyBackendError(msg: string): string {
    const text = (msg || '').replace(/\s+/g, ' ').trim();
    const lower = text.toLowerCase();
    if (lower.includes('invalid or corrupted .ots')) {
      return 'The .ots proof file is invalid or corrupted. Please upload the correct timestamp file.';
    }

    if (lower.includes('pending')) {
      return 'Timestamp exists but is not yet confirmed on Bitcoin. Please check again later.';
    }
    // Case 1: Failed fingerprint
    if (lower.includes('failed to calculate fingerprint of the file')) {
      console.error('Backend error:', text);
      return "File doesn't match the certificate.";
    }

    // Case 2: Verification output mismatch (handles "Verification" or "verification")
    if (lower.includes('verification output did not match expected patterns')) {
      console.error('Backend error:', text);
      return "File doesn't match the certificate.";
    }

    // Case 3: Fingerprint not found
    if (lower.includes("fingerprint not found in certificate")) {
      console.error('Backend error:', text);
      return "File doesn't match the certificate.";
    }

    // Case 4: Already starts with clean message
    if (lower.startsWith("file doesn't match the certificate.")) {
      console.error('Backend error:', text);
      return "File doesn't match the certificate.";
    }

    // Default → just log and return original
    console.error('Backend error (unmatched):', text);
    return text;
  }



  private handleSuccess(res: any) {
    this.isVerifying = false;
    this.backendResponse = res;

    if (!res?.otsStatus) {
      this.setError('Unexpected response from server.');
      return;
    }

    const status = res.otsStatus.status;

    if (status === 'pending') {
      this.successMessage =
        'The Bitcoin transaction is unconfirmed. Attestation is pending. It may take 2–24 hours. Please try again later.';
    }
    else if (status === 'verified') {
      this.successMessage =
        res.message || 'Timestamp verified on Bitcoin blockchain.';
    }
    else if (status === 'error') {
      const msg =
        res.otsStatus.message ||
        res.otsStatus.error ||
        res.message ||
        'Verification failed.';

      this.setError(this.prettifyBackendError(msg));
      return;
    }
    else {
      this.setError('Verification completed with unknown status.');
      return;
    }

    this.blocks = res.otsStatus.anchors || [];

    this.tsaResult = {
      status,
      message: res.otsStatus.message,
      details: res.otsStatus.details,
      error: res.otsStatus.error,
    };
  }



 private handleError(error: any) {
  this.isVerifying = false;

  const msg =
    error?.error?.message ||
    error?.error?.error ||
    error?.message ||
    'Verification failed. Please try again.';

  this.setError(this.prettifyBackendError(msg));
}

  private setError(msg: string) {


    this.errorMessage = msg;
    this.successMessage = null;
    this.tsaResult = null;
  }

  private resetStatus() {
    this.errorMessage = null;
    this.successMessage = null;
    this.tsaResult = null;
    this.blocks = [];
    this.backendResponse = null;
  }

  // Calculate SHA256 fingerprint of a file
  private calculateSHA256(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const buffer = reader.result as ArrayBuffer;
          const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
          resolve(hashHex);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject('Error reading file');
      reader.readAsArrayBuffer(file);
    });
  }

  // Extract SHA256 fingerprint from PDF certificate
  private async extractFingerprintFromPDF(pdfFile: File): Promise<string | null> {
    const pdfData = new Uint8Array(await pdfFile.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    let fingerprint: string | null = null;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(' ');
      const match = text.match(/[a-f0-9]{64}/i);
      if (match) {
        fingerprint = match[0].toLowerCase();
        break;
      }
    }
    return fingerprint;
  }
}
