import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.page.html',
  styleUrls: ['./admin-menu.page.scss'],
  standalone: false
})
export class AdminMenuPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToUsuarios() {
    this.router.navigate(['/admin/usuarios']);
  }

  goToReportes() {
    this.router.navigate(['/admin/reportes-de-usuarios']);
  }

  goToSolicitudesDeSoporte() {
    this.router.navigate(['/admin/solicitudes-de-soporte']);
  }

}
