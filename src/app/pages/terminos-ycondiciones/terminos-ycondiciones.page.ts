import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';

type SectionKey = 
  | 'introduccion'
  | 'definiciones'
  | 'datosPersonales'
  | 'contratos'
  | 'pagos'
  | 'envios'
  | 'obligaciones'
  | 'propiedad'
  | 'seguridad'
  | 'reportes'
  | 'responsabilidad'
  | 'modificaciones'
  | 'ley'
  | 'contacto'
  | 'tributario';

@Component({
  selector: 'app-terminos-ycondiciones',
  templateUrl: './terminos-ycondiciones.page.html',
  styleUrls: ['./terminos-ycondiciones.page.scss'],
  standalone: false
})
export class TerminosYCondicionesPage implements OnInit {

  sections: Record<SectionKey, boolean> = {
    introduccion: false,
    definiciones: false,
    datosPersonales: false,
    contratos: false,
    pagos: false,
    envios: false,
    obligaciones: false,
    propiedad: false,
    seguridad: false,
    reportes: false,
    responsabilidad: false,
    modificaciones: false,
    ley: false,
    contacto: false,
    tributario: false
  };

  usuario: any = null;
  rol: string = 'invitado';

  constructor(private authService: AuthService,
              private navCtrl: NavController,
              private router: Router
  ) {}

  async ngOnInit() {
    this.usuario = await this.authService.obtenerPerfil();

    if (this.usuario?.rol) {
      this.rol = this.usuario.rol;
    } else {
      this.rol = 'invitado';
    }
  }

  toggleSection(section: SectionKey) {
    this.sections[section] = !this.sections[section];
  }

  cerrarTerminos() {
    if (window.history.length > 1) {
      this.navCtrl.back();
    } else {
      this.router.navigate(['/home']);
    }
  }
}
