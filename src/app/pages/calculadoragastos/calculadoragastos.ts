import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

// Importaciones de Componentes PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

// Interfaz para la estructura del gasto
interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
  categoria: string;
}

@Component({
  selector: 'app-calculadoragastos', 
  standalone: true, 
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,

    // Módulos de PrimeNG
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    CardModule,
    DividerModule
  ],
  providers: [
    MessageService, 
    ConfirmationService
],
  template: `
    <p-toast></p-toast> 
    <p-confirmDialog [style]="{width: '50vw'}" [baseZIndex]="10000" acceptLabel="Sí, Eliminar" rejectLabel="No"></p-confirmDialog>

    <div class="p-5">
        <p-card header="Calculadora de Gastos de Viaje" styleClass="shadow-2xl">
            <ng-template pTemplate="subtitle">
                Gestión eficiente de tus gastos de viaje.
            </ng-template>

            <div class="flex justify-content-between align-items-center mb-4 p-4 border-round surface-100 border-1 surface-border">
                <p class="text-xl font-medium text-color">
                    Total de Gastos: 
                    <span class="font-bold text-2xl text-primary block sm:inline">
                        {{ totalGastos | currency: 'USD': 'symbol': '1.2-2': 'es-US' }}
                    </span>
                </p>
                <p-button 
                    label="Añadir Gasto" 
                    icon="pi pi-plus" 
                    (onClick)="showNewExpenseDialog()"
                    styleClass="p-button-success p-button-sm">
                </p-button>
            </div>

            <p-divider></p-divider>
            <p-table 
                [value]="gastos" 
                [tableStyle]="{'min-width': '10rem'}" 
                styleClass="p-datatable-gridlines p-datatable-sm shadow-2">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="categoria" style="width:20%">Categoría <p-sortIcon field="categoria"></p-sortIcon></th>
                        <th pSortableColumn="descripcion" style="width:40%">Descripción <p-sortIcon field="descripcion"></p-sortIcon></th>
                        <th pSortableColumn="monto" style="width:20%">Monto <p-sortIcon field="monto"></p-sortIcon></th>
                        <th style="width:20%">Acciones</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-gasto>
                    <tr>
                        <td>
                            <p-tag [value]="gasto.categoria" [severity]="getSeverity(gasto.categoria)"></p-tag>
                        </td>
                        <td>{{ gasto.descripcion }}</td>
                        <td class="font-bold text-gray-700">
                            {{ gasto.monto | currency: 'USD': 'symbol': '1.2-2': 'es-US' }}
                        </td>
                        <td>
                            <p-button 
                                icon="pi pi-trash" 
                                (onClick)="confirmarEliminarGasto(gasto)" 
                                styleClass="p-button-rounded p-button-danger p-button-text">
                            </p-button>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="4" class="text-center p-6 text-gray-500 text-base italic">No hay gastos registrados. ¡Empieza a añadir uno!</td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="summary">
                    <div class="flex justify-content-end font-bold text-lg">
                        Total General: {{ totalGastos | currency: 'USD': 'symbol': '1.2-2': 'es-US' }}
                    </div>
                </ng-template>
            </p-table>

        </p-card>
    </div>

    <p-dialog 
        header="Añadir Nuevo Gasto" 
        [(visible)]="displayDialog" 
        [modal]="true" 
        [style]="{width: '25vw'}" 
        [breakpoints]="{'960px': '75vw'}">
        
        <div class="p-fluid grid formgrid">
            <div class="field col-12">
                <label for="monto">Monto ($)</label>
                <p-inputNumber 
                    id="monto" 
                    [(ngModel)]="nuevoGasto.monto" 
                    [min]="0" 
                    mode="currency" 
                    currency="USD" 
                    locale="es-US"
                    required>
                </p-inputNumber>
            </div>

            <div class="field col-12">
                <label for="descripcion">Descripción</label>
                <input 
                    pInputText 
                    id="descripcion" 
                    type="text" 
                    [(ngModel)]="nuevoGasto.descripcion" 
                    placeholder="Ej: Boleto de bus, Cena, Souvenir" 
                    required/>
            </div>

            <div class="field col-12">
                <label for="categoria">Categoría</label>
                <input 
                    pInputText 
                    id="categoria" 
                    type="text" 
                    [(ngModel)]="nuevoGasto.categoria" 
                    placeholder="Ej: Transporte, Comida, Alojamiento" 
                    required/>
            </div>
        </div>

        <ng-template pTemplate="footer">
            <p-button label="Cancelar" icon="pi pi-times" (onClick)="displayDialog=false" styleClass="p-button-text"></p-button>
            <p-button label="Guardar" icon="pi pi-check" (onClick)="guardarGasto()"></p-button>
        </ng-template>
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculadoraGastosComponent implements OnInit {
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Propiedades
  gastos: Gasto[] = [];
  nuevoGasto: Gasto = this.resetGasto();
  displayDialog: boolean = false;
  totalGastos: number = 0;
  nextId: number = 1;
  
  constructor() { }

  ngOnInit() {
    // Datos de ejemplo iniciales
    this.gastos = [
      { id: this.nextId++, descripcion: 'Vuelo Santiago-Lima', monto: 350.50, categoria: 'Transporte' },
      { id: this.nextId++, descripcion: 'Noche Hotel 1', monto: 85.00, categoria: 'Alojamiento' },
      { id: this.nextId++, descripcion: 'Comida Día 1', monto: 45.75, categoria: 'Comida' },
      { id: this.nextId++, descripcion: 'Entrada Museo', monto: 20.00, categoria: 'Ocio' },
    ];
    this.calcularTotal();
  }

  /**
   * Genera la severidad de PrimeNG para el color del Tag basado en la categoría.
   * Ajustado para usar 'warn' y 'contrast' para cumplir con el tipado estricto del componente p-tag.
   */
  getSeverity(categoria: string): 'warn' | 'success' | 'info' | 'danger' | 'secondary' | 'contrast' {
    const lowerCaseCat = categoria.toLowerCase();
    // Corregido: 'warning' -> 'warn'
    if (lowerCaseCat.includes('transporte')) return 'warn'; 
    if (lowerCaseCat.includes('comida') || lowerCaseCat.includes('alimento')) return 'success';
    if (lowerCaseCat.includes('alojamiento') || lowerCaseCat.includes('hotel')) return 'info';
    // Corregido: 'help' -> 'contrast'
    if (lowerCaseCat.includes('ocio') || lowerCaseCat.includes('entretenimiento')) return 'contrast'; 
    return 'secondary';
  }

  resetGasto(): Gasto {
    return { id: 0, descripcion: '', monto: 0, categoria: '' };
  }

  calcularTotal() {
    this.totalGastos = this.gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
  }

  showNewExpenseDialog() {
    this.nuevoGasto = this.resetGasto();
    this.displayDialog = true;
  }

  guardarGasto() {
    // Asegurarse de que monto no sea null si el input es vacío y usar parseFloat por si acaso
    const monto = parseFloat(this.nuevoGasto.monto as unknown as string);
    const montoValido = !isNaN(monto) && monto > 0;

    if (montoValido && this.nuevoGasto.descripcion.trim() && this.nuevoGasto.categoria.trim()) {
      
      this.nuevoGasto.id = this.nextId++;
      this.nuevoGasto.monto = monto;

      this.gastos = [...this.gastos, this.nuevoGasto]; 
      
      this.calcularTotal();
      this.displayDialog = false;
      
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Gasto añadido correctamente.' });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor, rellena todos los campos con valores válidos.' });
    }
  }

  confirmarEliminarGasto(gasto: Gasto) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar el gasto: **${gasto.descripcion}**?`,
      header: 'Confirmación de Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.eliminarGasto(gasto.id);
      },
      reject: () => {
        // Cancelado
      }
    });
  }

  eliminarGasto(id: number) {
    this.gastos = this.gastos.filter(g => g.id !== id);
    this.calcularTotal();

    this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Gasto eliminado.' });
  }
}