import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaveManagement } from './wave-management';

describe('WaveManagement', () => {
  let component: WaveManagement;
  let fixture: ComponentFixture<WaveManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaveManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(WaveManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
