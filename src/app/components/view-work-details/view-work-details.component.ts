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