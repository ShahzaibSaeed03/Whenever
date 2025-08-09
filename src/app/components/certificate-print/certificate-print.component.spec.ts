import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificatePrintComponent } from './certificate-print.component';

describe('CertificatePrintComponent', () => {
  let component: CertificatePrintComponent;
  let fixture: ComponentFixture<CertificatePrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificatePrintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificatePrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
