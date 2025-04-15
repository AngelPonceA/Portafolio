import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
    private router: Router
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
      validators: this.passwordsMatchValidator
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

  async onSubmit() {
    if (this.passwordForm.valid) {
      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'Contraseña cambiada correctamente (simulación)',
        buttons: ['OK']
      });
      await alert.present();
      this.router.navigate(['/profile']);
    }
  }

  passwordsMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordsMismatch: true };
  }
}