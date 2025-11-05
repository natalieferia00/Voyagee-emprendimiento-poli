import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, NgForOf } from '@angular/common'; // Asegurar NgForOf está importado si *ngFor es usado en standalone
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
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
// import { DropdownModule } from 'primeng/dropdown'; // <-- MÓDULO ELIMINADO

// Interfaz para la estructura del ítem de alimentación
interface ItemAlimentacion {
  id: number;
  nombre: string;
  tipo: 'Restaurante' | 'Comida Rápida' | 'Supermercado' | 'Otro';
  ciudad: string;
  costoEstimado: number;
  notas: string;
}

// Opciones disponibles para el dropdown del tipo de ítem
interface TipoItem {
  label: string;
  value: 'Restaurante' | 'Comida Rápida' | 'Supermercado' | 'Otro';
}

@Component({
  selector: 'app-gestionalimentacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    // NgForOf, // NgForOf ya viene en CommonModule

    // Módulos de PrimeNG
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    DividerModule,
    TagModule,
    // DropdownModule, // <--- ELIMINADO
    
  ],
  providers: [
    MessageService, 
    ConfirmationService
  ],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog [style]="{width: '50vw'}" [baseZIndex]="10000" acceptLabel="Sí" rejectLabel="No"></p-confirmDialog>

    <div class="p-5">
      <p-card header="Gestión de Alimentación y Restaurantes" styleClass="shadow-2xl">
        <ng-template pTemplate="subtitle">
          Planifica dónde y cuánto gastarás en alimentos durante tu viaje.
        </ng-template>

        <div class="flex justify-content-between align-items-center mb-4 p-4 border-round surface-100 border-1 surface-border">
          <p class="text-xl font-medium text-color">
            Costo Estimado Total: 
            <span class="font-bold text-2xl text-primary block sm:inline">
              {{ costoTotalEstimado | currency: 'USD': 'symbol': '1.2-2': 'es-US' }}
            </span>
          </p>
          <p-button 
            label="Añadir Ítem" 
            icon="pi pi-plus" 
            (onClick)="showDialog(false)"
            styleClass="p-button-success p-button-sm">
          </p-button>
        </div>

        <p-divider></p-divider>
        
        
        <p-table 
          [value]="items" 
          [tableStyle]="{'min-width': '50rem'}" 
          styleClass="p-datatable-gridlines p-datatable-sm shadow-2">
          
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="nombre" style="width:25%">Nombre / Descripción <p-sortIcon field="nombre"></p-sortIcon></th>
              <th pSortableColumn="tipo" style="width:15%">Tipo <p-sortIcon field="tipo"></p-sortIcon></th>
              <th pSortableColumn="ciudad" style="width:20%">Ubicación (Ciudad) <p-sortIcon field="ciudad"></p-sortIcon></th>
              <th pSortableColumn="costoEstimado" style="width:15%">Costo Estimado <p-sortIcon field="costoEstimado"></p-sortIcon></th>
              <th style="width:15%">Notas</th>
              <th style="width:10%">Acciones</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-item>
            <tr>
              <td>{{ item.nombre }}</td>
              <td>
                <p-tag [value]="item.tipo" [severity]="getSeverity(item.tipo)"></p-tag>
              </td>
              <td>{{ item.ciudad }}</td>
              <td class="font-bold text-gray-700">
                {{ item.costoEstimado | currency: 'USD': 'symbol': '1.2-2': 'es-US' }}
              </td>
              <td>{{ item.notas.length > 30 ? (item.notas | slice:0:30) + '...' : item.notas }}</td>
              <td>
                <p-button 
                    icon="pi pi-pencil" 
                    (onClick)="showDialog(true, item)" 
                    styleClass="p-button-rounded p-button-info p-button-text p-mr-2">
                </p-button>
                <p-button 
                  icon="pi pi-trash" 
                  (onClick)="confirmarEliminarItem(item)" 
                  styleClass="p-button-rounded p-button-danger p-button-text">
                </p-button>
              </td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center p-6 text-gray-500 text-base italic">No hay ítems de alimentación planificados.</td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="summary">
            <div class="flex justify-content-end font-bold text-lg">
              Total Estimado: {{ costoTotalEstimado | currency: 'USD': 'symbol': '1.2-2': 'es-US' }}
            </div>
          </ng-template>
        </p-table>

      </p-card>
    </div>

    <p-dialog 
      [header]="isEditMode ? 'Editar Ítem de Alimentación' : 'Añadir Nuevo Ítem de Alimentación'" 
      [(visible)]="displayDialog" 
      [modal]="true" 
      [style]="{width: '30vw'}" 
      [breakpoints]="{'960px': '75vw'}">
      
      <div class="p-fluid grid formgrid">
        
        <div class="field col-12">
          <label for="nombre">Nombre / Descripción</label>
          <input 
            pInputText 
            id="nombre" 
            type="text" 
            [(ngModel)]="currentItem.nombre" 
            placeholder="Ej: Cena en 'El Buen Sabor'" 
            required/>
        </div>

        <div class="field col-12">
            <label for="tipo">Tipo de Lugar/Comida</label>
            <select 
                id="tipo" 
                [(ngModel)]="currentItem.tipo" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                required>
                <option value="" disabled>Selecciona el tipo</option>
                <option *ngFor="let tipo of tiposItem" [ngValue]="tipo.value">
                    {{ tipo.label }}
                </option>
            </select>
        </div>

        <div class="field col-12">
            <label for="ciudad">Ubicación (Ciudad/Zona)</label>
            <input 
              pInputText 
              id="ciudad" 
              type="text" 
              [(ngModel)]="currentItem.ciudad" 
              placeholder="Ej: Cusco, Perú" 
              required/>
        </div>

        <div class="field col-12">
          <label for="costoEstimado">Costo Estimado ($)</label>
          <p-inputNumber 
            id="costoEstimado" 
            [(ngModel)]="currentItem.costoEstimado" 
            [min]="0" 
            mode="currency" 
            currency="USD" 
            locale="es-US"
            required>
          </p-inputNumber>
        </div>

        <div class="field col-12">
            <label for="notas">Notas / Restricciones</label>
            <textarea 
                pInputText 
                id="notas" 
                rows="3" 
                [(ngModel)]="currentItem.notas" 
                placeholder="Ej: Vegetarianos, reservar con antelación">
            </textarea>
        </div>

      </div>

      <ng-template pTemplate="footer">
        <p-button label="Cancelar" icon="pi pi-times" (onClick)="displayDialog=false" styleClass="p-button-text"></p-button>
        <p-button [label]="isEditMode ? 'Guardar Cambios' : 'Añadir'" icon="pi pi-check" (onClick)="guardarItem()"></p-button>
      </ng-template>
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestionAlimentacionComponent implements OnInit {
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Propiedades
  items: ItemAlimentacion[] = [];
  currentItem: ItemAlimentacion = this.resetItem();
  displayDialog: boolean = false;
  costoTotalEstimado: number = 0;
  nextId: number = 1;
  isEditMode: boolean = false;

  // Tipos para el Dropdown
  tiposItem: TipoItem[] = [
    { label: 'Restaurante / Cena', value: 'Restaurante' },
    { label: 'Comida Rápida / Casual', value: 'Comida Rápida' },
    { label: 'Supermercado / Víveres', value: 'Supermercado' },
    { label: 'Otros (Café, Bar, etc.)', value: 'Otro' }
  ];

  constructor() { }

  ngOnInit() {
    // Datos de ejemplo iniciales
    this.items = [
      { id: this.nextId++, nombre: 'Cena en La Casa Andina', tipo: 'Restaurante', ciudad: 'Cusco', costoEstimado: 60.00, notas: 'Probar el plato local, reservar a las 8pm.' },
      { id: this.nextId++, nombre: 'Provisiones para 2 días', tipo: 'Supermercado', ciudad: 'Cusco', costoEstimado: 35.50, notas: 'Agua, snacks, fruta.' },
      { id: this.nextId++, nombre: 'Almuerzo rápido en Plaza', tipo: 'Comida Rápida', ciudad: 'Lima', costoEstimado: 12.00, notas: 'Opción económica.' },
    ];
    this.calcularTotal();
  }

  // --- Lógica de Utilidad y Apariencia ---

  resetItem(): ItemAlimentacion {
    return { id: 0, nombre: '', tipo: 'Restaurante', ciudad: '', costoEstimado: 0, notas: '' };
  }

  calcularTotal() {
    this.costoTotalEstimado = this.items.reduce((sum, item) => sum + item.costoEstimado, 0);
  }

  /**
   * Genera la severidad de PrimeNG para el color del Tag.
   */
  getSeverity(tipo: string): 'info' | 'success' | 'warn' | 'secondary' {
    switch (tipo) {
      case 'Restaurante':
        return 'info';
      case 'Comida Rápida':
        return 'warn'; 
      case 'Supermercado':
        return 'success';
      case 'Otro':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  // --- Lógica de Diálogo y CRUD ---

  showDialog(editMode: boolean, item?: ItemAlimentacion) {
    this.isEditMode = editMode;
    if (editMode && item) {
      // Clonar para evitar mutación directa si el usuario cancela la edición
      this.currentItem = { ...item }; 
    } else {
      this.currentItem = this.resetItem();
    }
    this.displayDialog = true;
  }

  guardarItem() {
    const nombreValido = this.currentItem.nombre.trim();
    const costoValido = this.currentItem.costoEstimado > 0;
    const ciudadValida = this.currentItem.ciudad.trim();

    if (nombreValido && costoValido && ciudadValida) {
      if (this.isEditMode) {
        // Modo Edición: Mapear para actualizar el ítem
        this.items = this.items.map(item => 
          item.id === this.currentItem.id ? this.currentItem : item
        );
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ítem actualizado correctamente.' });
      } else {
        // Modo Creación: Asignar ID y añadir
        this.currentItem.id = this.nextId++;
        this.items = [...this.items, this.currentItem];
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ítem añadido a la planificación.' });
      }
      
      this.calcularTotal();
      this.displayDialog = false;
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor, completa Nombre, Ciudad y Costo Estimado válidos.' });
    }
  }

  confirmarEliminarItem(item: ItemAlimentacion) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar la planificación de **${item.nombre}**?`,
      header: 'Confirmación de Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.eliminarItem(item.id);
      },
    });
  }

  eliminarItem(id: number) {
    this.items = this.items.filter(i => i.id !== id);
    this.calcularTotal();
    this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Ítem de alimentación eliminado.' });
  }
}