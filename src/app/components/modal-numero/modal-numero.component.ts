import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-modal-numero',
  templateUrl: './modal-numero.component.html',
  styleUrls: ['./modal-numero.component.scss'],
  standalone: false
})
export class ModalNumeroComponent implements OnInit {
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<string>();

  form!: FormGroup;

  constructor(private fb: FormBuilder,
              private modalCtrl: ModalController
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      telefono: [
        '',
        [Validators.required, Validators.pattern(/^\d{8}$/)]
      ]
    });
  }

  confirmar() {
    if (this.form.valid) {
      this.modalCtrl.dismiss(this.form.value.telefono);
    }
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }

  onInputTelefono(event: any) {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '').slice(0, 8);
    this.form.get('telefono')?.setValue(valor, { emitEvent: false });
  }
}
