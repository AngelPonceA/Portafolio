import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisSolucitudesDeSoportePage } from './mis-solucitudes-de-soporte.page';

describe('MisSolucitudesDeSoportePage', () => {
  let component: MisSolucitudesDeSoportePage;
  let fixture: ComponentFixture<MisSolucitudesDeSoportePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisSolucitudesDeSoportePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
