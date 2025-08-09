import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import html2pdf from 'html2pdf.js';
import { Work, WorkService } from '../../service/work-service.service';


@Component({
  selector: 'app-certificate-print',
  imports: [CommonModule, RouterModule],
  templateUrl: './certificate-print.component.html',
  styleUrls: ['./certificate-print.component.css']
})
export class CertificatePrintComponent implements OnInit {
  work: Work | null = null;

  @ViewChild('pdfContent') pdfContent!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private workService: WorkService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.workService.getWorkById(id).subscribe(data => {
      this.work = data;
    });
  }

  print() {
    window.print();
  }

  downloadPdf() {
    const opt = {
      margin: 0.5,
      filename: `${this.work?.title || 'certificate'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().from(this.pdfContent.nativeElement).set(opt).save();
  }
}
