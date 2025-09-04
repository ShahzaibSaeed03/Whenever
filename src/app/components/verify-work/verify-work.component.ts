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

      console.log('🔍 Verifying with FormData:', formData);

      this.workService.verifyWork(formData).subscribe(
        (res: any) => this.handleSuccess(res),
        (error) => this.handleError(error)
      );
    } catch (err) {
      console.error('❌ Unexpected Error:', err);
      this.setError('Error reading files. Please try again.');
      this.isVerifying = false;
    }
  }
  // 🔧 NEW: normalize backend error strings
  private prettifyBackendError(msg: string): string {
    const text = (msg || '').replace(/\s+/g, ' ').trim(); // collapse spaces
    const lower = text.toLowerCase();

    // Normalize: "Failed to calculate fingerprint of the file" → with "the" + trailing period
    if (lower.startsWith('failed to calculate fingerprint of the file')) {
      return 'Failed to calculate the fingerprint of the file.';
    }
    if (lower.startsWith('Verification output did not match expected patterns')) {
      return "File doesn't match the certificate. The uploaded file and certificate are different. Please upload the related files.";
    }

    return text;
  }

  private handleSuccess(res: any) {
    this.isVerifying = false;
    this.backendResponse = res;

    if (res?.otsStatus) {
      this.blocks = res.otsStatus.anchors || [];

      if (res.otsStatus.status === 'pending') {
        this.successMessage = "The Bitcoin transaction is unconfirmed. The attestation is still pending. It may take 2 to 24 hours.Please try again later on.";
      } else if (res.otsStatus.status === 'verified') {
        this.successMessage = res.message || 'Verification successful.';
      } else if (res.otsStatus.status === 'error') {
        this.setError(res.otsStatus.error || res.message || "Verification failed.");
      } else {
        this.setError(res.message || 'Verification completed with unknown status.');
      }

      this.tsaResult = {
        status: res.otsStatus.status,
        message: res.otsStatus.message,
        details: res.otsStatus.details,
        error: res.otsStatus.error,
      };
    } else {
      this.setError('Unexpected response format.');
    }

    console.log('✅ Backend Response:', res);
  }



  private handleError(error: any) {
    this.isVerifying = false;

    console.error('❌ Backend Error:', error);
    let msg =
      error?.error?.message ||
      error?.error?.error ||
      error?.message ||
      (typeof error?.error === 'string' ? error.error : JSON.stringify(error?.error || error));

    // 🔧 apply normalization here
    msg = this.prettifyBackendError(msg);
    this.setError(msg);
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
