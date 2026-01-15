import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-conversor-moneda',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, DialogModule, InputNumberModule, ButtonModule, RippleModule],
  template: `
    <p-dialog 
      [(visible)]="visible" 
      [modal]="true" 
      [style]="{ width: '420px' }" 
      [draggable]="false" 
      [resizable]="false"
      [closable]="true"
      appendTo="body"
      header="Conversor de Moneda"
      styleClass="voyagee-clean-dialog"
      (onHide)="close()"
    >
      <ng-template pTemplate="content">
        <div class="flex flex-col gap-3 pt-2">
          
          <div class="flex flex-col gap-1">
            <label class="font-bold text-sm text-700">Monto en COP</label>
            <p-inputNumber 
              [(ngModel)]="montoCOP" 
              (onInput)="convertir()" 
              placeholder="Ej. 50.000" 
              [autofocus]="true"
              inputStyleClass="p-3 border-round-lg border-1 surface-border text-lg"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-bold text-sm text-700">Moneda de destino</label>
            <select 
              [(ngModel)]="monedaSeleccionada" 
              (change)="actualizarTasa()"
              class="p-3 border-round-lg border-1 surface-border bg-white text-lg outline-none"
              style="height: 54px;"
            >
              <option *ngFor="let m of opcionesMonedas" [value]="m.code">{{ m.label }}</option>
            </select>
          </div>

          <div class="flex justify-center -my-1">
            <i class="pi pi-arrow-down text-400" style="font-size: 0.9rem;"></i>
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-bold text-sm text-700">Monto estimado en {{monedaSeleccionada}}</label>
            <p-inputNumber 
              [ngModel]="montoConvertido" 
              mode="currency" 
              [currency]="monedaSeleccionada" 
              [disabled]="true"
              inputStyleClass="p-3 border-round-lg border-1 surface-border bg-gray-50 font-bold text-lg text-900"
            />
          </div>

          <div class="flex justify-end mt-2 pr-1">
            <span class="text-md text-600 font-semibold italic">
              Tasa: 1 COP ≈ {{ tasaActual | number:'1.2-6' }} {{ monedaSeleccionada }}
            </span>
          </div>
        </div>
      </ng-template>

      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          <p-button label="Cancelar" [text]="true" severity="secondary" (onClick)="close()" />
          <p-button label="Guardar" icon="pi pi-check" severity="success" styleClass="bg-green-500 border-none px-4" (onClick)="guardar()" />
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .voyagee-clean-dialog { border: none !important; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important; }
    :host ::ng-deep .p-dialog .p-dialog-header { background: #ffffff !important; padding: 1.25rem 1.5rem 0.5rem !important; }
    :host ::ng-deep .p-dialog .p-dialog-content { background: #ffffff !important; padding: 0.5rem 1.5rem 1rem !important; }
    :host ::ng-deep .p-inputnumber-input { width: 100%; }
    .text-lg { font-size: 1.15rem !important; }
  `]
})
export class ConversorMonedaComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  
  montoCOP: number | null = null;
  montoConvertido: number = 0;
  monedaSeleccionada: string = 'USD';
  tasaActual: number = 0.00025; // Tasa inicial de respaldo

  // Tasas de respaldo por si la API no carga de inmediato
  tasasGlobales: any = {
    "USD": 0.00025,
    "EUR": 0.00023,
    "MXN": 0.0043,
    "ARS": 0.21,
    "GBP": 0.00019,
    "CHF": 0.00021
  };

  opcionesMonedas = [
    { label: 'Dólar (USD)', code: 'USD' },
    { label: 'Euro (EUR)', code: 'EUR' },
    { label: 'Peso Mexicano (MXN)', code: 'MXN' },
    { label: 'Peso Argentino (ARS)', code: 'ARS' },
    { label: 'Libra Esterlina (GBP)', code: 'GBP' },
    { label: 'Franco Suizo (CHF)', code: 'CHF' }
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarTasas();
  }

  cargarTasas() {
    // API pública sin necesidad de Key para pruebas rápidas
    const url = 'https://open.er-api.com/v6/latest/COP';
    this.http.get(url).subscribe({
      next: (res: any) => {
        this.tasasGlobales = res.rates;
        this.actualizarTasa();
      },
      error: () => {
        console.warn("Usando tasas de respaldo locales");
        this.actualizarTasa();
      }
    });
  }

  actualizarTasa() {
    this.tasaActual = this.tasasGlobales[this.monedaSeleccionada] || 0;
    this.convertir();
  }

  convertir() {
    if (this.montoCOP && this.tasaActual) {
      // Uso de Math para redondear a 2 decimales
      this.montoConvertido = Math.round((this.montoCOP * this.tasaActual) * 100) / 100;
    } else {
      this.montoConvertido = 0;
    }
    this.cdr.detectChanges();
  }

  guardar() { this.close(); }
  close() { this.visible = false; this.visibleChange.emit(this.visible); }
}