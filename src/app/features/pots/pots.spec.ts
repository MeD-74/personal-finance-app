import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pots } from './pots';

describe('Pots', () => {
  let component: Pots;
  let fixture: ComponentFixture<Pots>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pots],
    }).compileComponents();

    fixture = TestBed.createComponent(Pots);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
