import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gestionalimentacion } from './gestionalimentacion';

describe('Gestionalimentacion', () => {
  let component: Gestionalimentacion;
  let fixture: ComponentFixture<Gestionalimentacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gestionalimentacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gestionalimentacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
