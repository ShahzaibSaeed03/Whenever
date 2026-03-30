import { Component, OnInit } from '@angular/core';
import { WorkService } from '../../service/work-service.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-original-works',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-original-works.component.html'
})
export class MyOriginalWorksComponent implements OnInit {

  originalData: any[] = [];
  data: any[] = [];

  tokens = 0;
  billingDate = '';

  showDeleteModal = false;
  deleteWorkId: any = null;

  showPasswordModal = false;
  selectedWork: any = null;
  sharePassword = '';
  isTokenLoaded = false;
  filters: any = {
    id: '',
    title: '',
    from: '',
    to: ''
  };

  constructor(
    private workService: WorkService,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.load();

    this.workService.getTokenDetails()
      .subscribe((res: any) => {
        this.tokens = res.remainingTokens;
        this.billingDate = res.nextBillingDate;
        this.isTokenLoaded = true; // ✅ mark loaded
      });
  }

  /* LOAD */
  load() {
    const userId = localStorage.getItem('userId');

    this.workService.getWorkById(userId).subscribe((res: any) => {
      this.data = (res.data || []).map((item: any) => ({
        ...item,
        shareUrl: item.shareId
          ? `${window.location.origin}/share/${item.shareId}`
          : null
      }));

      this.originalData = [...this.data];
    });
  }

  /* SEARCH */
  search() {

    let filtered = [...this.originalData];

    if (this.filters.id) {
      filtered = filtered.filter(w =>
        String(w.displayed_ID).toLowerCase()
          .includes(this.filters.id.toLowerCase())
      );
    }

    if (this.filters.title) {
      filtered = filtered.filter(w =>
        w.title?.toLowerCase()
          .includes(this.filters.title.toLowerCase())
      );
    }

    if (this.filters.from) {
      const from = new Date(this.filters.from);
      filtered = filtered.filter(w =>
        new Date(w.registration_date) >= from
      );
    }

    if (this.filters.to) {
      const to = new Date(this.filters.to);
      filtered = filtered.filter(w =>
        new Date(w.registration_date) <= to
      );
    }

    this.data = filtered;
  }

  /* RESET */
  resetFilters() {
    this.filters = { id: '', title: '', from: '', to: '' };
    this.data = [...this.originalData];
  }

  viewCertificate(item: any) {
    this.selectedCertificate = item;
    this.showCertificateModal = true;
  }

  download(item: any) {
    if (!item.downloadUrl) {
      this.toast.error('File not available');
      return;
    }

    const a = document.createElement('a');
    a.href = item.downloadUrl;
    a.download = item.file_name || 'file';
    a.click();

    this.toast.success('Download started');
  }

  delete(id: any) {
    this.deleteWorkId = id;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    this.workService.deleteWork(this.deleteWorkId)
      .subscribe(() => {
        this.toast.success('Deleted');
        this.load();
        this.closeDelete();
      });
  }
  closeCertificateModal() {
    this.showCertificateModal = false;
    this.selectedCertificate = null;
  }
  closeDelete() {
    this.showDeleteModal = false;
    this.deleteWorkId = null;
  }

  openSetPassword(item: any) {
    this.selectedWork = item;
    this.showPasswordModal = true;
  }



  confirmPassword = '';

  savePassword() {

    if (!this.selectedWork) return;

    if (this.sharePassword.length < 6) {
      this.toast.error('Password min 6');
      return;
    }

    if (this.sharePassword !== this.confirmPassword) {
      this.toast.error('Passwords do not match');
      return;
    }

    this.workService
      .setPassword(this.selectedWork._id, this.sharePassword)
      .subscribe((res: any) => {
        this.selectedWork.shareId = res.shareId;
        this.selectedWork.passwordProtected = true;

        this.toast.success('Password set');
        this.closeModal();
      });
  }

  closeModal() {
    this.showPasswordModal = false;
    this.sharePassword = '';
    this.confirmPassword = '';
    this.selectedWork = null;
  }
  downloadAllFiles(work: any) {

 const urls = [
  { url: work.downloadUrl, name: work.file_name },
  { url: work.certificateUrl, name: `Certificate-${work.displayed_ID}.pdf` },
  { url: work.otsUrl, name: `Timestamp-${work.displayed_ID}.ots` }
].filter(f => f.url);

    urls.forEach((file, index) => {
      setTimeout(() => {

        fetch(file.url)
          .then(res => res.blob())
          .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = file.name || 'file';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            window.URL.revokeObjectURL(blobUrl);
          });

      }, index * 1200); // delay to avoid browser blocking

    });

  }
  copyLink(item: any) {

    if (!item.shareId) {
      this.toast.error('Share link not available');
      return;
    }

    const link = `${window.location.origin}/share/${item.shareId}`;

    navigator.clipboard.writeText(link)
      .then(() => this.toast.success('Share link copied'))
      .catch(() => this.toast.error('Failed to copy link'));
  }


  showShareModal = false;
  shareLink = '';

  openShareModal(item: any) {

    if (!item.shareId) {
      this.toast.error('Share link not available');
      return;
    }

    this.shareLink = `${window.location.origin}/share/${item.shareId}`;
    this.showShareModal = true;
  }

  closeShareModal() {
    this.showShareModal = false;
    this.shareLink = '';
  }

  copyFromModal() {
    navigator.clipboard.writeText(this.shareLink)
      .then(() => {
        this.toast.success('Link copied');
        this.closeShareModal(); // 👈 close modal here
      })
      .catch(() => this.toast.error('Failed to copy'));
  }
  showCertificateModal = false;
  selectedCertificate: any = null;
}