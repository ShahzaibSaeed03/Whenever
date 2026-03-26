import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkService } from '../../service/work-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-work',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-work.component.html'
})
export class ViewWorkComponent implements OnInit {

  work: any = null;
  shareId = '';
  certificateImg = 'Certif.png';

  constructor(
    private route: ActivatedRoute,
    private workService: WorkService
  ) { }

  ngOnInit() {

    this.shareId = this.route.snapshot.paramMap.get('shareId') || '';

    this.workService.getSharedWork(this.shareId)
      .subscribe((res: any) => {
        this.work = res.data;
      });

  }
downloadCertificate() {

  if (!this.work?.certificateUrl) return;

  this.download(
    this.work.certificateUrl,
    `Certificate-${this.work.displayed_ID}.pdf`
  );

}
 download(url: string, name: string) {

  if (!url) {
    console.error('Invalid URL');
    return;
  }

  fetch(url, {
    method: 'GET',
    headers: {
      'Accept': '*/*'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.blob();
  })
  .then(blob => {

    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = name || 'download';
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(blobUrl);

  })
  .catch(err => {
    console.error('Download error:', err);

    // fallback (IMPORTANT)
    window.open(url, '_blank');
  });

}
downloadAll() {

  if (!this.work) return;

  // Original file
  this.download(this.work.downloadUrl, this.work.file_name);

  // Certificate PDF
  this.download(
    this.work.certificateUrl,
    `Certificate-${this.work.displayed_ID}.pdf`
  );

  // OTS file
  this.download(
    this.work.otsUrl,
    `Timestamp-${this.work.displayed_ID}.ots`
  );

}
}