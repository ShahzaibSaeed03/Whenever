import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkService } from '../../service/work-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-work',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-work.component.html'
})
export class ViewWorkComponent implements OnInit {

  work: any = null;
  shareId = '';
  certificateImg = 'Certif.png';

  constructor(
    private route: ActivatedRoute,
    private workService: WorkService
  ) { }

  ngOnInit() {

    this.shareId = this.route.snapshot.paramMap.get('shareId') || '';

    this.workService.getSharedWork(this.shareId)
      .subscribe((res: any) => {
        this.work = res.data;
      });

  }

  download(url: string, name: string) {

    fetch(url)
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        const obj = URL.createObjectURL(blob);
        a.href = obj;
        a.download = name;
        a.click();
        URL.revokeObjectURL(obj);
      });

  }

}