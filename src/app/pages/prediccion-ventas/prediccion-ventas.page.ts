import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CrudService } from 'src/app/services/crud/crud.service';
import Chart from 'chart.js/auto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prediccion-ventas',
  templateUrl: './prediccion-ventas.page.html',
  styleUrls: ['./prediccion-ventas.page.scss'],
  standalone: false,
})
export class PrediccionVentasPage implements OnInit, AfterViewInit {
  cargando = true;
  ventasPorProducto: { [producto_id: string]: any[] } = {};
  productos: string[] = [];
  estimacionUsuario: any = {};
  anioRecientePorProducto: { [producto_id: string]: number } = {};
  prediccionAuto: { [producto_id: string]: number[] } = {};
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  @ViewChildren('chartCanvas') chartCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  charts: Chart[] = [];

  expandirTabla: { [productoId: string]: boolean } = {};

  constructor(private crudService: CrudService, private router: Router) {}

  async ngOnInit() {
    this.cargando = true;
    const ventas = await this.crudService.obtenerVentasHistoricas();

    // Agrupa y ordena ventas por producto, año y mes
    ventas.forEach(v => {
      if (!this.ventasPorProducto[v.producto_id]) this.ventasPorProducto[v.producto_id] = [];
      this.ventasPorProducto[v.producto_id].push(v);
    });
    this.productos = Object.keys(this.ventasPorProducto);

    // Carga estimaciones de usuario para cada producto
    for (const producto_id of this.productos) {
      this.ventasPorProducto[producto_id].sort((a, b) => a.anio - b.anio || a.mes - b.mes);

      // Año más reciente
      const anios = this.ventasPorProducto[producto_id].map(v => v.anio);
      const anioReciente = Math.max(...anios);
      this.anioRecientePorProducto[producto_id] = anioReciente;

      // Predicción automática: promedio de años anteriores para cada mes
      const prevAnios = anios.filter(anio => anio < anioReciente);
      this.prediccionAuto[producto_id] = Array.from({ length: 12 }, (_, mesIdx) => {
        const mes = mesIdx + 1;
        const ventasMes = this.ventasPorProducto[producto_id].filter(
          v => v.mes === mes && prevAnios.includes(v.anio)
        );
        if (ventasMes.length === 0) return 0;
        const suma = ventasMes.reduce((acc, v) => acc + v.cantidad, 0);
        return Math.round(suma / ventasMes.length);
      });

      // Carga la estimación del usuario (espera a que termine)
      const estimacion = await this.crudService.obtenerEstimacionUsuario(producto_id);
      this.estimacionUsuario[producto_id] = Array.isArray(estimacion) ? [...estimacion] : Array(12).fill(null);
    }

    this.cargando = false;
    setTimeout(() => this.renderCharts(), 0);
  }

  ngAfterViewInit() {
    this.chartCanvases.changes.subscribe(() => this.renderCharts());
  }

  renderCharts() {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];

    this.productos.forEach((producto_id, idx) => {
      const ventas = this.ventasPorProducto[producto_id];
      if (!ventas.length) return;

      // Encuentra el año más reciente
      const anioReciente = this.anioRecientePorProducto[producto_id];
      const ventasAnio = ventas.filter(v => v.anio === anioReciente);
      const labels = Array.from({length: 12}, (_, i) => `${anioReciente}-${i+1}`);
      const data = labels.map(label => {
        const mes = parseInt(label.split('-')[1], 10);
        const venta = ventasAnio.find(v => v.mes === mes);
        return venta ? venta.cantidad : 0;
      });
      const prediccion = this.prediccionAuto[producto_id] || Array(12).fill(0);
      const estimacion = (this.estimacionUsuario[producto_id] || []).slice(0, 12);

      const canvas = this.chartCanvases.get(idx)?.nativeElement;
      if (!canvas) return;

      const chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: this.meses,
          datasets: [
            { label: 'Ventas', data, backgroundColor: '#D2B48C' },
            { label: 'Predicción', data: prediccion, backgroundColor: 'rgba(76,175,80,0.5)' },
            { label: 'Estimación usuario', data: estimacion, backgroundColor: 'rgba(25,118,210,0.4)' }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                callback: function(value) {
                  return Number.isInteger(value) ? value : '';
                }
              }
            }
          }
        }
      });
      this.charts.push(chart);
    });
  }

  async actualizarGrafico(producto_id: string, idx: number) {
    // Fuerza referencia nueva para que Angular detecte el cambio
    this.estimacionUsuario[producto_id] = [...this.estimacionUsuario[producto_id]];
    const chart = this.charts[idx];
    if (chart) {
      chart.data.datasets[2].data = this.estimacionUsuario[producto_id];
      chart.update();
    }
    await this.crudService.actualizarEstimacionUsuario(producto_id, this.estimacionUsuario[producto_id]);
  }

  obtenerCantidadReal(producto: any, mes: number): number {
    const ventas = this.ventasPorProducto[producto];
    const anio = this.anioRecientePorProducto[producto];
    if (!ventas || !anio) 
      return 0;
    const venta = ventas.find((v: any) => v.anio === anio && v.mes === mes);
    return venta?.cantidad ?? 0;
  }

  obtenerPrediccion(producto: any, i: number): number {
    return this.prediccionAuto[producto] && this.prediccionAuto[producto][i] != null ? this.prediccionAuto[producto][i] : 0;
  }

  verDetalle(producto_id: string) {
    this.router.navigate(['/producto'], { state: { producto_id } });
  }

}
