import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cambio-nombre-usuario',
  templateUrl: './cambio-nombre-usuario.page.html',
  styleUrls: ['./cambio-nombre-usuario.page.scss'],
  standalone: false
})
export class CambioNombreUsuarioPage {
  currentUsername: string = 'Usuario123'; // Valor fijo para demo
  usernameForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private router: Router
  ) {
    this.usernameForm = this.fb.group({
      newUsername: ['', [Validators.required, Validators.maxLength(30)]],
    });
  }

  async onSubmit() {
    if (this.usernameForm.valid) {
      const newUsername = this.usernameForm.value.newUsername;
      
      // Simular actualización exitosa
      const alert = await this.alertController.create({
        header: 'Éxito (Demo)',
        message: `En una implementación real, tu nombre de usuario sería cambiado a: ${newUsername}`,
        buttons: ['OK'],
      });
      
      await alert.present();
      this.currentUsername = newUsername; // Actualizar localmente
      this.usernameForm.reset();
    }
  }


}