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
import { Router } from '@angular/router';

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
  tiposCuenta: { label: string; valor: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group({
      titular: ['', Validators.required],
      numeroCuenta: [
        '',
        [Validators.required, Validators.pattern(/^\d{6,20}$/)],
      ],
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
        try { init = JSON.parse(init); } catch { init = null; }
      }
      if (init) {
        this.form.patchValue({
          titular: init.titular || '',
          banco: init.banco || '',
          numeroCuenta: init.numeroCuenta || '',
          tipoCuenta: init.tipoCuenta || null,
          aceptarTerminos: false,
        });
        this.filtrarTiposCuenta();
      }
    }
  }

  irATerminos() {
    this.cancelar();
    this.router.navigate(['/terminos-ycondiciones']);
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
    this.filtrarTiposCuenta();
  }

  filtrarTiposCuenta() {
    const banco = this.form.value.banco?.toLowerCase().trim() || '';
    this.tiposCuenta = [
      { label: 'Cuenta Vista', valor: 'vista' },
      { label: 'Cuenta Corriente', valor: 'corriente' },
    ];
    if (banco === 'banco estado') {
      this.tiposCuenta.unshift({ label: 'Cuenta RUT', valor: 'rut' });
    }
    // Reset tipo si ya no corresponde
    const tipoActual = this.form.value.tipoCuenta;
    const existeTipo = this.tiposCuenta.find((t) => t.valor === tipoActual);
    if (!existeTipo) this.form.patchValue({ tipoCuenta: null });
    this.ajustarValidacionNumeroCuenta(this.form.value.tipoCuenta);
  }

  seleccionarTipoCuenta(tipo: { valor: string; label: string }) {
    this.form.get('tipoCuenta')?.setValue(tipo.valor);
    this.ajustarValidacionNumeroCuenta(tipo.valor);
  }

  onInputNumeroCuenta(event: any) {
    const tipoCuenta = this.form.value.tipoCuenta;
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');

    let max = 12;
    if (tipoCuenta === 'rut') max = 8;
    if (valor.length > max) valor = valor.slice(0, max);

    this.form.patchValue({ numeroCuenta: valor }, { emitEvent: false });
  }

  ajustarValidacionNumeroCuenta(tipoCuenta: string) {
    let min = 12;
    let max = 12;
    if (tipoCuenta === 'rut') {
      min = 7;
      max = 8;
    }
    this.form
      .get('numeroCuenta')
      ?.setValidators([
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(min),
        Validators.maxLength(max),
      ]);
    this.form.get('numeroCuenta')?.updateValueAndValidity();
  }

  limpiarFormulario() {
    this.form.reset({
      titular: '',
      banco: '',
      numeroCuenta: '',
      tipoCuenta: null,
      aceptarTerminos: false,
    });
    this.bancosFiltrados = [];
    this.tiposCuenta = [];
  }
}
