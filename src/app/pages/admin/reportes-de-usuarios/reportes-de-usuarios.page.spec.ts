import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportesDeUsuariosPage } from './reportes-de-usuarios.page';

describe('ReportesDeUsuariosPage', () => {
  let component: ReportesDeUsuariosPage;
  let fixture: ComponentFixture<ReportesDeUsuariosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportesDeUsuariosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
