import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-conversor-moneda',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, InputNumberModule, ButtonModule, RippleModule],
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

          <div class="flex justify-center -my-1">
            <i class="pi pi-arrow-down text-400" style="font-size: 0.9rem;"></i>
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-bold text-sm text-700">Monto estimado en USD</label>
            <p-inputNumber 
              [ngModel]="montoUSD" 
              mode="currency" 
              currency="USD" 
              [disabled]="true"
              inputStyleClass="p-3 border-round-lg border-1 surface-border bg-gray-50 font-bold text-lg text-900"
            />
          </div>

          <div class="flex justify-end mt-2 pr-1">
            <span class="text-md text-600 font-semibold italic">
              Tasa: 1 USD ≈ {{ tasaCambio | number }} COP
            </span>
          </div>
        </div>
      </ng-template>

      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          <p-button 
            label="Cancelar" 
            [text]="true" 
            severity="secondary" 
            (onClick)="close()" 
          />
          <p-button 
            label="Guardar" 
            icon="pi pi-check" 
            severity="success" 
            styleClass="bg-green-500 border-none px-4"
            (onClick)="guardar()" 
          />
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    /* Eliminamos cualquier rastro de fondo azul del overlay */
    :host ::ng-deep .voyagee-clean-dialog {
        border: none !important;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
    }

    :host ::ng-deep .p-dialog .p-dialog-header {
      background: #ffffff !important;
      padding: 1.25rem 1.5rem 0.5rem 1.5rem !important;
      border: none !important;
    }

    :host ::ng-deep .p-dialog .p-dialog-content {
      background: #ffffff !important;
      padding: 0.5rem 1.5rem 1rem 1.5rem !important;
      border: none !important;
    }

    :host ::ng-deep .p-inputnumber-input {
      width: 100%;
    }

    .text-lg {
      font-size: 1.15rem !important;
    }

    .text-md {
      font-size: 1rem !important;
    }
  `]
})
export class ConversorMonedaComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  
  montoCOP: number | null = null;
  montoUSD: number = 0;
  tasaCambio: number = 3950;

  constructor(private cdr: ChangeDetectorRef) {}

  convertir() {
    this.montoUSD = this.montoCOP ? this.montoCOP / this.tasaCambio : 0;
    this.cdr.detectChanges();
  }

  guardar() {
    this.close();
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
}