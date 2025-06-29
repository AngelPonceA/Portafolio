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
    this.router.navigate(['/usuarios']);
  }

  goToSolicitudesDeSoporte() {
    this.router.navigate(['/solicitudes-de-soporte']);
  }

  goToReportes() {
    this.router.navigate(['/reportes-de-usuarios']);
  }

}
