import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-certificate-display',
  imports: [CommonModule, RouterModule],
  templateUrl: './certificate-display.component.html',
  styleUrl: './certificate-display.component.css'
})
export class CertificateDisplayComponent {
 data = {
    workTitle: 'My Great Work Title',
    copyrightOwner: 'John Doe',
    additionalOwners: 'Jane Smith, Alan Snow',
    referenceNumber: 'WH123456789',
    registrationDate: '13 JULY 2025 10:52:22',
    authority: 'Open Timestamps',
    fileName: 'creative-artwork.zip',
    fileHash: 'd8b42b8e5249f4204a682d13f8754c7faef3a76b65...',
  };
}
