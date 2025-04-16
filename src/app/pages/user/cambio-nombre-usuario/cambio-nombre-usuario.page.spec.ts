import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CambioNombreUsuarioPage } from './cambio-nombre-usuario.page';

describe('CambioNombreUsuarioPage', () => {
  let component: CambioNombreUsuarioPage;
  let fixture: ComponentFixture<CambioNombreUsuarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CambioNombreUsuarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
