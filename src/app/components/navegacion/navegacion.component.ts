import { Component, OnInit } from '@angular/core';

//Imports acá abajo para no confundirnos
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navegacion',
  imports: [ IonicModule, CommonModule],
  templateUrl: './navegacion.component.html',
  styleUrls: ['./navegacion.component.scss'],
  
})
export class NavegacionComponent  implements OnInit {

  notificaciones: number = 15;
  productos: number = 3;

  
  constructor( private router: Router ) { }
  
  ngOnInit() {}
  
  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

}
