import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsAgainstPlagiaristsComponent } from './actions-against-plagiarists.component';

describe('ActionsAgainstPlagiaristsComponent', () => {
  let component: ActionsAgainstPlagiaristsComponent;
  let fixture: ComponentFixture<ActionsAgainstPlagiaristsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsAgainstPlagiaristsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionsAgainstPlagiaristsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
