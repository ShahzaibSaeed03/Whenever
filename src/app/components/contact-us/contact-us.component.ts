import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkService } from '../../service/work-service.service';

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

  constructor(private workService: WorkService) {}

  submit(formRef: any) {

    if (!this.form.name || !this.form.email || !this.form.subject || !this.form.message) {
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.workService.contactUs(this.form).subscribe({

      next: () => {
        this.successMessage = 'Your message has been sent successfully.';
        this.loading = false;
        formRef.resetForm();
      },

      error: () => {
        this.errorMessage = 'Something went wrong. Please try again.';
        this.loading = false;
      }

    });

  }

}