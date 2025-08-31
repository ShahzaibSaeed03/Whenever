import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-prompt',
  imports: [CommonModule,RouterLink],
  templateUrl: './login-prompt.component.html',
  styleUrl: './login-prompt.component.css'
})
export class LoginPromptComponent {
  @Input() show = false;
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}
