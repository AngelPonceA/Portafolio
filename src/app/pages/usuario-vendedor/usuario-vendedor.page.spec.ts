import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioVendedorPage } from './usuario-vendedor.page';

describe('UsuarioVendedorPage', () => {
  let component: UsuarioVendedorPage;
  let fixture: ComponentFixture<UsuarioVendedorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioVendedorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
