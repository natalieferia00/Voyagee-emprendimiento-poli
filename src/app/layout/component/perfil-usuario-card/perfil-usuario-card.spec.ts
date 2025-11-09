import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilUsuarioCard } from './perfil-usuario-card';

describe('PerfilUsuarioCard', () => {
  let component: PerfilUsuarioCard;
  let fixture: ComponentFixture<PerfilUsuarioCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilUsuarioCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilUsuarioCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
