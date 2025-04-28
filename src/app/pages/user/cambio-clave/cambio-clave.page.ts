import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-cambioclave',
  templateUrl: './cambio-clave.page.html', 
  styleUrls: ['./cambio-clave.page.scss'],
  standalone: false,
})
export class CambioClavePage implements OnInit {
  passwordForm: FormGroup;
  currentPasswordType: string = 'password';
  newPasswordType: string = 'password';
  confirmPasswordType: string = 'password';

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private router: Router,
    private authService: AuthService

  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: [
        '', 
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$')
        ]
      ],
      confirmPassword: ['', Validators.required]
    }, {
      validators: [this.passwordsMatchValidator, this.currentAndNewPasswordDifferentValidator]
    });
  }

  ngOnInit() {}

  toggleCurrentPasswordType() {
    this.currentPasswordType = this.currentPasswordType === 'password' ? 'text' : 'password';
  }

  toggleNewPasswordType() {
    this.newPasswordType = this.newPasswordType === 'password' ? 'text' : 'password';
  }

  toggleConfirmPasswordType() {
    this.confirmPasswordType = this.confirmPasswordType === 'password' ? 'text' : 'password';
  }

  async onSubmit(group: any) {
    if (this.passwordForm.valid) {
      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'Contraseña cambiada correctamente (simulación)',
        buttons: ['OK']
      });
      await this.authService.cambiarClave(group.currentPassword, group.newPassword);      
      await alert.present();
      this.passwordForm.reset();
    }
  }

  passwordsMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordsMismatch: true };
  }

  currentAndNewPasswordDifferentValidator(group: FormGroup) {
    const currentPassword = group.get('currentPassword')?.value;
    const newPassword = group.get('newPassword')?.value;
    return currentPassword && newPassword && currentPassword === newPassword
      ? { currentAndNewPasswordSame: true }
      : null;
  }

}