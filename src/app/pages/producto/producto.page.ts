import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud/crud.service';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
  standalone: false
})

export class ProductoPage implements OnInit {

  item?: any;
  contacto?: number;

  constructor(private router: Router, private crudService: CrudService) {

    const nav = this.router.getCurrentNavigation();
    this.item = nav?.extras.state?.['item'];
    
  }
    
    ngOnInit() {
    }

    mensajeWhatsApp(usuario_id: string){
      this.crudService.obtenerContactoID(this.item.producto.usuario_id).then(telefono => {
        const url = `https://wa.me/${telefono}?text=Hola, tengo interés en su producto`;
        window.open(url, '_blank');
    });

    }
  
}
