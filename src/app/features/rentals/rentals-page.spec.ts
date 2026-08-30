import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RentalsPage } from './rentals-page';

describe('RentalsPage', () => {
  let component: RentalsPage;
  let fixture: ComponentFixture<RentalsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(RentalsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
