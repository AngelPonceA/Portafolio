import { AuthService } from 'src/app/services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { FirebaseError } from '@angular/fire/app';

@Component({
  selector: 'app-recuperar-clave',
  templateUrl: './recuperar-clave.page.html',
  styleUrls: ['./recuperar-clave.page.scss'],
  standalone: false,
})
export class RecuperarClavePage implements OnInit {

  forgetPasswordForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private alertController: AlertController,
    private authService: AuthService,
  ) {
    this.forgetPasswordForm = this.fb.group({
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(30)],
      ],
    });
  }

  ngOnInit() {
  }

  async onSubmit() {
    if (this.forgetPasswordForm.valid && this.forgetPasswordForm.get('email')?.valid) {
      const email: string = this.forgetPasswordForm.value.email?.trim();
      
      // Mostrar mensaje de éxito simple
      const alert = await this.alertController.create({
        header: 'Recuperación de contraseña',
        message: `Funcionalidad de recuperación simulada para: ${email}`,
        buttons: ['OK'],
      });

      this.authService.recuperarClave(this.forgetPasswordForm.value.email?.trim())
      .then(() => {
        console.log('Correo enviado para recuperar la contraseña.');
        alert.present();
        this.forgetPasswordForm.reset();
        this.router.navigate(['/ingreso']);
      })
      .catch((error: FirebaseError) => {
        // Manejar el error y dar una mejor experiencia de usuario
        if (error.code === 'auth/user-not-found') {
          console.log('No se encuentra un usuario con ese correo electrónico.');
        }
        else if (error.code === 'auth/invalid-email') {
          console.log('Formato de correo no valido.');
        } else {
          console.log('Error al enviar el correo:', error);
          console.log('Ocurrió un error inesperado. Inténtalo nuevamente.');
        }
      });

    }
  }

}
