import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkService } from '../../service/work-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
selector:'app-view-work-details',
standalone:true,
imports:[CommonModule,FormsModule],
templateUrl:'./view-work-details.component.html'
})
export class ViewWorkDetailsComponent implements OnInit{

shareId:string='';
password='';
workData:any=null;

loading=false;
errorMessage='';
successMessage='';

constructor(
private route:ActivatedRoute,
private workService:WorkService
){}

ngOnInit(){


}
formatUTCDate(dateStr: string): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);

  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
}
/* ACCESS WORK */
access(){
this.workService.accessByReference(this.reference,this.password)
.subscribe((res:any)=>{
this.workData=res.data;
});
}
reference="";

/* OPEN CERTIFICATE */
viewCertificate(){
window.open(this.workData.certificateUrl,'_blank');
}

/* DOWNLOAD FILE */
download(){

const a=document.createElement('a');
a.href=this.workData.downloadUrl;
a.download=this.workData.file_name;
a.click();

}
}