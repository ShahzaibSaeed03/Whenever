import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-contact-us',
  imports: [CommonModule,FormsModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent {
 constructor(private http: HttpClient) {}

   form:any = {
    name:'',
    email:'',
    subject:'',
    message:''
  };

  submit(){

    emailjs.send(
      'SERVICE_ID',
      'TEMPLATE_ID',
      {
        to_email: 'codexthrill@gmail.com',
        from_name: this.form.name,
        from_email: this.form.email,
        subject: this.form.subject,
        message: this.form.message
      },
      'PUBLIC_KEY'
    ).then(()=>{
      alert('Sent');
      this.form={};
    })
    .catch(err=>{
      console.log(err);
    });
  }
}
