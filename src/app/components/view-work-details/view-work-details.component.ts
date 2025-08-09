import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-work-details',
  imports: [CommonModule,FormsModule],
  templateUrl: './view-work-details.component.html',
  styleUrls: ['./view-work-details.component.css']
})
export class ViewWorkDetailsComponent {

  @Input() workData: any = null; // Verify ka result yaha milega

  getStatusClass(status: string) {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'not-found': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

}
