import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-tarjeta-depositos',
  templateUrl: './modal-tarjeta-depositos.component.html',
  styleUrls: ['./modal-tarjeta-depositos.component.scss'],
  standalone: false
})
export class ModalTarjetaDepositosComponent {

  @Input() datosIniciales: any = null;
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();

  form: FormGroup;

  bancos: string[] = [
    'Banco de Chile',
    'Banco Estado',
    'Banco Santander',
    'Banco BICE',
    'Banco Itaú',
    'Banco Scotiabank',
    'Banco Falabella',
    'Banco Ripley',
    'Banco Consorcio',
    'Banco Security',
    'Banco Internacional',
    'Banco BTG Pactual',
    'JP Morgan Chase Bank',
    'Deutsche Bank',
    'Banco do Brasil',
    'Banco de Crédito e Inversiones (BCI)',
    'HSBC Bank',
    'Rabobank Chile'
  ];
  bancosFiltrados: string[] = [];

  tiposCuentaBase = [
    { valor: 'vista', label: 'Cuenta Vista' },
    { valor: 'corriente', label: 'Cuenta Corriente' },
    { valor: 'rut', label: 'Cuenta RUT' },
  ];
  tiposCuenta: { label: string; valor: string }[] = [];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      titular: ['', Validators.required],
      numeroTarjeta: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      vencimiento: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      banco: ['', Validators.required],
      tipoCuenta: ['', Validators.required],
      aceptarTerminos: [false, Validators.requiredTrue],
    });
  }

  ngOnInit() {
    const bancoControl = this.form.get('banco');
      bancoControl?.valueChanges.subscribe((val: string) => {
        if (this.bancos.includes(val)) {
          this.filtrarTiposCuenta();
        } else {
          this.tiposCuenta = [];
          this.form.patchValue({ tipoCuenta: null });
        }
      });

        if (this.datosIniciales) {
          this.form.patchValue({ ...this.datosIniciales, aceptarTerminos: false });
        }
        this.form.get('banco')?.valueChanges.subscribe(() => this.filtrarTiposCuenta());
      }

  confirmar() {
    if (this.form.valid) {
      this.form.disable();
      this.submit.emit(this.form.value);
    }
  }

  cancelar() {
    this.cancel.emit();
  }

  filtrarBancos(event: any) {
    const valor = event.detail.value?.toLowerCase() || '';
    if (valor.length === 0) {
      this.bancosFiltrados = [];
      return;
    }
    this.bancosFiltrados = this.bancos.filter(banco =>
      banco.toLowerCase().includes(valor)
    );
  }

  seleccionarBanco(banco: string) {
    this.form.patchValue({ banco });
    this.bancosFiltrados = [];
  }

  filtrarTiposCuenta() {
  const banco = this.form.value.banco?.toLowerCase().trim() || '';

  this.tiposCuenta = [
    { label: 'Cuenta Vista', valor: 'vista' },
    { label: 'Cuenta Corriente', valor: 'corriente' }
  ];

  if (banco === 'banco estado') {
    this.tiposCuenta.unshift({
      label: 'Cuenta RUT',
      valor: 'rut'
    });
  }

  const tipoActual = this.form.value.tipoCuenta;
  const existeTipo = this.tiposCuenta.find(t => t.valor === tipoActual);
  if (!existeTipo) {
    this.form.patchValue({ tipoCuenta: null });
  }
}

  seleccionarTipoCuenta(tipo: { valor: string; label: string }) {
    this.form.get('tipoCuenta')?.setValue(tipo.valor);
  }
}
