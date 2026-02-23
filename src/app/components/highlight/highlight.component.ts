import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HIGHLIGHTS } from './highlights.data';

@Component({
  selector: 'app-highlight',
  imports: [CommonModule],
  templateUrl: './highlight.component.html',
  styleUrl: './highlight.component.css'
})
export class HighlightComponent {
  items = HIGHLIGHTS;

}
