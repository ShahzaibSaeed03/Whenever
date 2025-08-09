import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './password-modal.component.html',
})
export class PasswordModalComponent {
  @Input() visible = false;
  @Input() workTitle = '';
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>();

  password = '';
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  handleSave() {
    this.save.emit(this.password);
    this.password = '';
    this.close.emit();
    this.showPassword = false;
  }
}
