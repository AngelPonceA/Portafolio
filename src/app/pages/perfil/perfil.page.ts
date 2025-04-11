import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,

})
export class PerfilPage implements OnInit {

  usuario: any = {
    id: 1,
    nombre: 'Juan Pérez',
    correo: 'juanitooficial@gmail.com',
    avatar: 'https://preview.redd.it/colored-this-kirby-meme-a-friend-sent-me-v0-rpau79c9o31a1.png?width=640&crop=smart&auto=webp&s=fafd4b695974a98b6795b8cc326cf1c45fb2f571'  
  }

  constructor(private router: Router) { }

  ngOnInit( ) {
  }

  cerrarSesion() {
      this.router.navigate(['/home']);
    }
    

}
