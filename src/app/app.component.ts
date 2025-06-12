import { Component, OnInit } from '@angular/core';
import { CrudService } from './services/crud/crud.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(private crudService: CrudService) {}

  ngOnInit() {
    this.crudService.escucharCambiosPedidos();
  }
}
