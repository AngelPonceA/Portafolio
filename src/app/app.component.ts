import { Component, OnInit } from '@angular/core';
import { TriggersService } from './services/triggers/triggers.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(private triggersService: TriggersService) {}

  ngOnInit() {
    this.triggersService.escucharCambiosPedido();

    this.triggersService.escucharCambiosDetallePedido();

    this.triggersService.escucharCambiosStock();

    this.triggersService.escucharCreacionPedido();
  }
  
}
