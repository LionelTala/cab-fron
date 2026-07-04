import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormationManagement } from './formation-management';

describe('FormationManagement', () => {
  let component: FormationManagement;
  let fixture: ComponentFixture<FormationManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormationManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(FormationManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
