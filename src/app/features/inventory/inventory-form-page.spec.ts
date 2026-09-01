import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryFormPage } from './inventory-form-page';

describe('InventoryFormPage', () => {
  let component: InventoryFormPage;
  let fixture: ComponentFixture<InventoryFormPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryFormPage],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryFormPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
