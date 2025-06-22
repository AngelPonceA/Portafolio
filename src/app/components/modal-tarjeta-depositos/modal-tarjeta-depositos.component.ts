import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-tarjeta-depositos',
  templateUrl: './modal-tarjeta-depositos.component.html',
  styleUrls: ['./modal-tarjeta-depositos.component.scss'],
  standalone: false,
})
export class ModalTarjetaDepositosComponent implements OnInit, OnChanges {
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
    'Rabobank Chile',
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
      numeroTarjeta: [
        '',
        [Validators.required, Validators.pattern(/^\d{16}$/)],
      ],
      vencimiento: [
        '',
        [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)],
      ],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      banco: ['', Validators.required],
      tipoCuenta: ['', Validators.required],
      aceptarTerminos: [false, Validators.requiredTrue],
    });
  }

  ngOnInit() {
    this.form.get('banco')!.valueChanges.subscribe((val: string) => {
      this.filtrarBancos({ detail: { value: val } });
      if (this.bancos.includes(val)) {
        this.filtrarTiposCuenta();
      } else {
        this.tiposCuenta = [];
        this.form.patchValue({ tipoCuenta: null });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['datosIniciales'] && this.datosIniciales) {
      let init = this.datosIniciales;
      if (typeof init === 'string') {
        try {
          init = JSON.parse(init);
        } catch {
          init = null;
        }
      }

      if (init) {
        this.form.patchValue({
          titular: init.titular || '',
          banco: init.banco || '',
          numeroTarjeta: init.numeroTarjeta || '',
          vencimiento: init.vencimiento || '',
          cvv: init.cvv || '',
          tipoCuenta: init.tipoCuenta || null,
          aceptarTerminos: false,
        });
        this.filtrarTiposCuenta();
      }
    }
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
    this.bancosFiltrados = valor
      ? this.bancos.filter((b) => b.toLowerCase().includes(valor))
      : [];
  }

  seleccionarBanco(banco: string) {
    this.form.patchValue({ banco });
    this.bancosFiltrados = [];
  }

  filtrarTiposCuenta() {
    const banco = this.form.value.banco?.toLowerCase().trim() || '';

    this.tiposCuenta = [
      { label: 'Cuenta Vista', valor: 'vista' },
      { label: 'Cuenta Corriente', valor: 'corriente' },
    ];

    if (banco === 'banco estado') {
      this.tiposCuenta.unshift({
        label: 'Cuenta RUT',
        valor: 'rut',
      });
    }

    const tipoActual = this.form.value.tipoCuenta;
    const existeTipo = this.tiposCuenta.find((t) => t.valor === tipoActual);
    if (!existeTipo) {
      this.form.patchValue({ tipoCuenta: null });
    }
  }

  seleccionarTipoCuenta(tipo: { valor: string; label: string }) {
    this.form.get('tipoCuenta')?.setValue(tipo.valor);
  }

  limpiarFormulario() {
    this.form.reset({
      titular: '',
      banco: '',
      numeroTarjeta: '',
      vencimiento: '',
      cvv: '',
      tipoCuenta: null,
      aceptarTerminos: false,
    });

    this.bancosFiltrados = [];
    this.tiposCuenta = [];
  }
}
