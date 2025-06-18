import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisSolicitudesDeSoportePage } from './mis-solicitudes-de-soporte.page';

describe('MisSolicitudesDeSoportePage', () => {
  let component: MisSolicitudesDeSoportePage;
  let fixture: ComponentFixture<MisSolicitudesDeSoportePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisSolicitudesDeSoportePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
