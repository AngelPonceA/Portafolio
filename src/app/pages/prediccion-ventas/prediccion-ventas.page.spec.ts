import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrediccionVentasPage } from './prediccion-ventas.page';

describe('PrediccionVentasPage', () => {
  let component: PrediccionVentasPage;
  let fixture: ComponentFixture<PrediccionVentasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PrediccionVentasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
