import { Component, OnInit } from '@angular/core';

//Imports acá abajo para no confundirnos
import { IonicModule } from '@ionic/angular';
import { IonFooter, IonHeader, IonSearchbar, IonButton, IonIcon,} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navegacion',
  imports: [IonFooter, IonHeader, IonSearchbar, IonButton, IonIcon,],
  templateUrl: './navegacion.component.html',
  styleUrls: ['./navegacion.component.scss'],
  
})
export class NavegacionComponent  implements OnInit {

  constructor( private router: Router ) { }

  ngOnInit() {}

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

}
