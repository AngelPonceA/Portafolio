import { Component, OnInit } from '@angular/core';
import { Usuario } from 'src/app/models/usuario.models';
import { Firestore, collection, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { IonicService } from 'src/app/services/ionic/ionic.service';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
  standalone: false
})
export class UsuariosPage implements OnInit {
  usuarios: Usuario[] = [];

  constructor(private navCtrl: NavController,
              private firestore: Firestore,
              private ionicService: IonicService,
              private alertController: AlertController
  ) { }

  ngOnInit() {
    this.cargarUsuarios();
  }

  async cargarUsuarios() {
    try {
      const snapshot = await getDocs(collection(this.firestore, 'usuarios'));
      this.usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Usuario[];
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      this.ionicService.mostrarToastAbajo('Error al cargar usuarios');
    }
  }

    async bloquearUsuario(usuario: Usuario) {
      try {
        const confirmado = await this.mostrarAlerta(
          '¿Bloquear usuario?',
          `¿Estás seguro de que deseas bloquear a ${usuario.nombre}?`
        );
        if (!confirmado) return;

        const usuarioRef = doc(this.firestore, `usuarios/${usuario.id}`);
        await updateDoc(usuarioRef, { estaBloqueado: true });

        this.usuarios = this.usuarios.map(u =>
          u.id === usuario.id ? { ...u, estaBloqueado: true } : u
        );

        this.ionicService.mostrarToastAbajo('Usuario bloqueado');
      } catch (error) {
        console.error('Error al bloquear usuario:', error);
        this.ionicService.mostrarToastAbajo('No se pudo bloquear el usuario');
      }
    }

    volverAtras() {
    this.navCtrl.back();
  }

  async mostrarAlerta(titulo: string, mensaje: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: titulo,
        message: mensaje,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Aceptar',
            handler: () => resolve(true)
          }
        ]
      });

      await alert.present();
    });
  }
}
