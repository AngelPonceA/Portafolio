import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false
})
export class RegistroPage implements OnInit {
  registerForm: FormGroup;
  passwordType: string = 'password';
  confirmPasswordType: string = 'password';


  constructor(private router: Router, private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ÿ\\s]+$'), Validators.maxLength(30)]],
      username: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(30)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'),
        ]
      ],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit() {}

  togglePasswordType() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  toggleConfirmPasswordType() {
    this.confirmPasswordType = this.confirmPasswordType === 'password' ? 'text' : 'password';
  }  

  passwordsMatch(formGroup: AbstractControl): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  registrar() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      console.log('Formulario inválido. Revisa los campos.');
      return;
    }

    const { username, email, password } = this.registerForm.value;

    this.authService.registrar(username, email, password);
    this.registerForm.reset();
  }
}
