import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyOriginalWorksComponent } from './my-original-works.component';

describe('MyOriginalWorksComponent', () => {
  let component: MyOriginalWorksComponent;
  let fixture: ComponentFixture<MyOriginalWorksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyOriginalWorksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyOriginalWorksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
