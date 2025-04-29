import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-cambio-nombre-usuario',
  templateUrl: './cambio-nombre-usuario.page.html',
  styleUrls: ['./cambio-nombre-usuario.page.scss'],
  standalone: false
})
export class CambioNombreUsuarioPage {
  usernameForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private router: Router,
    private authService: AuthService 
  ) {
    this.usernameForm = this.fb.group({
      newUsername: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15), Validators.pattern('^[a-zA-ZÀ-ÿ]+$')]],
    });
  }

  async onSubmit() {
    if (this.usernameForm.valid) {
      const newUsername = this.usernameForm.value.newUsername;
      
      // Simular actualización exitosa
      const alert = await this.alertController.create({
        header: 'Éxito',
        message: `Su nombre se estableció como: ${newUsername}`,
        buttons: ['OK'],
      });
      
      await alert.present();
      this.authService.actualizarNombre(newUsername);
      this.usernameForm.reset();
    }
  }


}