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
    /* modal */
    showPasswordModal = false;
    selectedWork: any = null;
    sharePassword = '';

    /* filters */
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

            });

    }



    /* LOAD WORKS */
    load() {
        const userId = localStorage.getItem('userId');

        this.workService.getWorkById(userId).subscribe((res: any) => {
            this.data = res.data || [];
            this.originalData = [...this.data];   // ⭐ keep copy
        });
    }

search(){

let filtered=[...this.originalData];

if(this.filters.id){
filtered = filtered.filter(w =>
String(w.displayed_ID)
.toLowerCase()
.includes(this.filters.id.toLowerCase())
);
}

if(this.filters.title){
filtered = filtered.filter(w =>
w.title?.toLowerCase()
.includes(this.filters.title.toLowerCase())
);
}

if(this.filters.from){
const from=new Date(this.filters.from);
filtered = filtered.filter(w =>
new Date(w.registration_date) >= from
);
}

if(this.filters.to){
const to=new Date(this.filters.to);
filtered = filtered.filter(w =>
new Date(w.registration_date) <= to
);
}

this.data=filtered;
}
resetFilters(){

this.filters={
id:'',
title:'',
from:'',
to:''
};

this.data=[...this.originalData];
}
    /* =========================
    VIEW CERTIFICATE
    ========================= */
    viewCertificate(item: any) {

        if (!item.certificateUrl) {
            this.toast.error('Certificate not available');
            return;
        }

        window.open(item.certificateUrl, '_blank');
    }

    /* =========================
    DOWNLOAD ORIGINAL FILE
    ========================= */
    download(item: any) {

        if (!item.downloadUrl) {
            this.toast.error('File not available');
            return;
        }

        const a = document.createElement('a');
        a.href = item.downloadUrl;
        a.target = '_blank';
        a.download = item.file_name || 'file';
        document.body.appendChild(a);
        a.click();
        a.remove();

        this.toast.success('Download started');
    }

    /* =========================
    DELETE WORK
    ========================= */
    delete(id: any) {
        this.deleteWorkId = id;
        this.showDeleteModal = true;
    }
    confirmDelete() {

        this.workService.deleteWork(this.deleteWorkId).subscribe(() => {
            this.toast.success('Deleted');
            this.load();
            this.closeDelete();
        });

    }

    closeDelete() {
        this.showDeleteModal = false;
        this.deleteWorkId = null;
    }
    /* =========================
    OPEN PASSWORD MODAL
    ========================= */
    openSetPassword(item: any) {
        this.selectedWork = item;
        this.showPasswordModal = true;
    }

    /* CLOSE MODAL */
    closeModal() {
        this.showPasswordModal = false;
        this.sharePassword = '';
        this.selectedWork = null;
    }

    /* =========================
    SET PASSWORD → CREATE LINK
    ========================= */
    savePassword() {

        if (!this.selectedWork) return;

        if (this.sharePassword.length < 6) {
            this.toast.error('Password min 6');
            return;
        }

        this.workService
            .setPassword(this.selectedWork._id, this.sharePassword)
            .subscribe((res: any) => {

                /* mark share enabled */
                this.selectedWork.shareUrl = res.shareUrl; // flag only

                this.toast.success('Password set');
                this.closeModal();

            });
    }

    /* =========================
    COPY SHARE LINK
    ========================= */
    copyLink(item: any) {

        /* must have password set */
        if (!item.shareUrl) {
            this.toast.warning('Set password first');
            return;
        }

        /* copy displayed ID instead of URL */
        navigator.clipboard.writeText(item.displayed_ID);

        this.toast.success('Reference ID copied');
    }

}