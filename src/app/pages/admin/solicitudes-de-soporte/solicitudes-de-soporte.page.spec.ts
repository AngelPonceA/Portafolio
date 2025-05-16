import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolicitudesDeSoportePage } from './solicitudes-de-soporte.page';

describe('SolicitudesDeSoportePage', () => {
  let component: SolicitudesDeSoportePage;
  let fixture: ComponentFixture<SolicitudesDeSoportePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudesDeSoportePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
