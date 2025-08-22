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

  errorMessage = '';
successMessage: string | null = null;
  tsaResult: any = null;
  isVerifying = false;
  blocks: any[] = [];
  backendResponse: any = null;

  constructor(
    private workService: WorkService,
    private toastr: ToastrService
  ) {}

  // Handle file selection
  onFileChange(event: Event, type: 'file' | 'certificate' | 'otsFile') {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const selectedFile = input.files[0];
    if (type === 'file') this.file = selectedFile;
    else if (type === 'certificate') this.certificate = selectedFile;
    else if (type === 'otsFile') this.otsFile = selectedFile;
  }

  // Main verification flow
  async verify() {
    this.errorMessage = '';
    this.successMessage = '';
    this.tsaResult = null;
    this.backendResponse = null;

    if (!this.file || !this.certificate || !this.otsFile) {
      this.errorMessage =
        'Please first select the file to be verified, its certificate and its .ots file.';
      console.error('❌ Missing file(s)', {
        file: this.file,
        certificate: this.certificate,
        otsFile: this.otsFile,
      });
      return;
    }

    this.isVerifying = true;

    try {
      const fileFingerprint = await this.calculateSHA256(this.file);
      const certFingerprint = await this.extractFingerprintFromPDF(this.certificate);

      if (!certFingerprint || fileFingerprint !== certFingerprint) {
        this.isVerifying = false;
        this.errorMessage = 'File doesn’t match the certificate.';
        this.toastr.error(this.errorMessage);
        return;
      }

      const formData = new FormData();
      formData.append('originalFile', this.file);
      formData.append('certificate', this.certificate);
      formData.append('ots', this.otsFile);

      this.workService.verifyWork(formData).subscribe(
        (res: any) => {
          console.log('✅ Backend Response:', res);
          this.blocks = res.otsStatus.anchors || [];
          this.isVerifying = false;
          this.backendResponse = res;

          if (res?.otsStatus) {
            this.successMessage = res.message || 'Verification completed.';
            this.tsaResult = {
              status: res.otsStatus.status,
              message: res.otsStatus.message,
              details: res.otsStatus.details,
              error: res.otsStatus.error,
            };
          } else {
            this.errorMessage = 'Unexpected response format.';
            this.toastr.error(this.errorMessage);
          }
        },
        (error) => {
          this.isVerifying = false;
          console.error('❌ Backend Error:', error);
          this.errorMessage = error.error?.message || 'Something went wrong. Please try again.';
          this.toastr.error(this.errorMessage);
        }
      );
    } catch (err) {
      this.isVerifying = false;
      console.error('❌ Unexpected Error:', err);
      this.errorMessage = 'Error reading files. Please try again.';
      this.toastr.error(this.errorMessage);
    }
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
