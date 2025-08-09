import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFAQComponent } from './upload-faq.component';

describe('UploadFAQComponent', () => {
  let component: UploadFAQComponent;
  let fixture: ComponentFixture<UploadFAQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadFAQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadFAQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
