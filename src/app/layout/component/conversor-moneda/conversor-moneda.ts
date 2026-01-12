import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-conversor-moneda',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, InputNumberModule, ButtonModule],
  template: `
    <p-dialog
      header="Conversor de Moneda"
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '900px' }"
      [contentStyle]="{'overflow': 'visible'}" 
      [draggable]="false"
      [resizable]="false"
      appendTo="body"
    >
      <div class="flex flex-column gap-4 mt-2">
        
        <div class="flex flex-column gap-2">
          <label class="font-semibold text-700">Monto en COP</label>
          <p-inputNumber
            [(ngModel)]="montoCOP"
            name="cop"
            (onInput)="convertir()"
            placeholder="Ingrese valor"
            class="w-full"
            inputStyleClass="w-full p-3 border-round-lg text-lg font-bold"
            [autofocus]="true"
          ></p-inputNumber>
        </div>

        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-arrow-down text-400"></i>
        </div>

        <div class="flex flex-column gap-2">
          <label class="font-semibold text-700">Monto estimado en USD</label>
          <p-inputNumber
            [ngModel]="montoUSD"
            name="usd"
            mode="currency"
            currency="USD"
            [disabled]="true"
            class="w-full"
            inputStyleClass="w-full p-3 border-round-lg text-lg font-bold bg-gray-100"
          ></p-inputNumber>
        </div>

        <div class="text-center py-2 bg-bluegray-50 border-round-md">
           <small class="text-600">Tasa: 1 USD ≈ {{ tasaCambio | number }} COP</small>
        </div>

        <div class="flex justify-content-end gap-2 mt-2">
          <button
            pButton
            label="Cancelar"
            class="p-button-text p-button-secondary"
            (click)="visible=false"
          ></button>

          <button
            pButton
            label="Guardar"
            icon="pi pi-check"
            class="p-button-success"
            (click)="visible=false"
          ></button>
        </div>
      </div>
    </p-dialog>
  `,
  styles: [`
    /* Forzamos a que PrimeNG no oculte el contenido por error de cálculo */
    :host ::ng-deep .p-inputnumber {
        display: flex !important;
        width: 100% !important;
    }
    
    :host ::ng-deep .p-inputnumber-input {
        width: 100% !important;
        display: block !important;
    }

    :host ::ng-deep .p-dialog-content {
        padding: 1.5rem !important;
    }
  `]
})
export class ConversorMonedaComponent {
  visible: boolean = true;
  montoCOP: number | null = null;
  montoUSD: number = 0;
  tasaCambio: number = 3950;

  convertir() {
    if (this.montoCOP) {
      this.montoUSD = this.montoCOP / this.tasaCambio;
    } else {
      this.montoUSD = 0;
    }
  }
}