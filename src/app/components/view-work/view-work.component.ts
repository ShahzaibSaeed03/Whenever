import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { WorkService } from '../../service/work-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-view-work',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-work.component.html',
})
export class ViewWorkComponent {

  work:any=null;
  showViewer=false;

  shareId='';
  password='';
  loading=false;

  constructor(
    private route:ActivatedRoute,
    private workService:WorkService,
    private toast:ToastrService,
    private sanitizer:DomSanitizer
  ){
    this.shareId=this.route.snapshot.paramMap.get('shareId')||'';
  }

  submit(){

    if(!this.password){
      this.toast.warning('Enter password');
      return;
    }

    this.loading=true;

    this.workService.verifyShare(this.shareId,this.password)
    .subscribe({
      next:(res:any)=>{
        this.openViewer(res.data);
        this.loading=false;
      },
      error:()=>{
        this.toast.error('Wrong password');
        this.loading=false;
      }
    });
  }

  openViewer(data:any){
    this.work=data;
    this.showViewer=true;
  }

  closeViewer(){
    this.showViewer=false;
    this.work=null;
  }

  safe(url:string):SafeResourceUrl{
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  download(url:string,name:string){

    fetch(url)
    .then(r=>r.blob())
    .then(blob=>{
      const a=document.createElement('a');
      const obj=URL.createObjectURL(blob);
      a.href=obj;
      a.download=name;
      a.click();
      URL.revokeObjectURL(obj);
    });
  }
}