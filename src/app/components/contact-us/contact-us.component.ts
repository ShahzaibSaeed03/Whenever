import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-contact-us',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent {

  loading = false;
  successMessage = '';
  errorMessage = '';

  form = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  submit(formRef: any) {

    if (!this.form.name || !this.form.email || !this.form.subject || !this.form.message) {
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      {
        to_email: 'chaim.miller@outlook.com', // client test email
        from_name: this.form.name,
        from_email: this.form.email,
        subject: this.form.subject,
        message: this.form.message
      },
      'YOUR_PUBLIC_KEY'
    )
    .then(() => {

      this.successMessage = 'Your message has been sent successfully.';
      this.loading = false;

      formRef.resetForm(); // properly clears form

    })
    .catch((error) => {

      this.errorMessage = 'Something went wrong. Please try again.';
      this.loading = false;

      console.error(error);
    });
  }
}