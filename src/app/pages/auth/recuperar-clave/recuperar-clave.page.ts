import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

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
    private alertController: AlertController
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
      
      await alert.present();
      this.forgetPasswordForm.reset();
      this.router.navigate(['/ingreso']);
    }
  }

}
