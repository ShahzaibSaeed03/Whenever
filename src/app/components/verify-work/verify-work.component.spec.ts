import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyWorkComponent } from './verify-work.component';

describe('VerifyWorkComponent', () => {
  let component: VerifyWorkComponent;
  let fixture: ComponentFixture<VerifyWorkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyWorkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
