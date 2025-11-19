import { Component, OnInit, ChangeDetectionStrategy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';

/* PrimeNG Components */
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

interface Gasto {
  id: number;
  pais: string;
  nombre: string;
  descripcion: string;
  monto: number;
}

@Component({
  selector: 'app-calculadora-gastos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    CardModule,
    DividerModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `

    <p-toast></p-toast>
    <p-confirmDialog [style]="{width: '40vw'}" [baseZIndex]="10000"
        acceptLabel="Sí, eliminar" rejectLabel="No"></p-confirmDialog>

    <div class="p-5">
      <p-card header="Calculadora de Gastos de Viaje" styleClass="shadow-2xl">
        <ng-template pTemplate="subtitle">
          Administra tus gastos de viaje por país.
        </ng-template>

        <!-- BARRA SUPERIOR ESTILO PRIME NG FILTERING -->
        <div class="flex justify-content-between align-items-center mb-6">

          <!-- Clear Filtros -->
          <p-button 
            label="Clear" 
            icon="pi pi-filter-slash" 
            styleClass="p-button-outlined p-button-success"
            (onClick)="dt.clear()"
             class="mr-220">>
          </p-button>

          <!-- Search -->
          <span class="p-input-icon-left">
            <input 
              pInputText
              #filterInput
              type="text"
              placeholder="Search keyword"
              (input)="onGlobalFilter($event, dt)"
              class="w-15rem"
            />
          </span>
        </div>

        <!-- TABLA PRINCIPAL -->
        <p-table #dt
          [value]="gastos"
          dataKey="id"
          [rows]="10"
          [paginator]="true"
          [rowHover]="true"
          [globalFilterFields]="['pais', 'nombre', 'descripcion']"
          responsiveLayout="scroll"
          styleClass="p-datatable-sm shadow-2">

          <!-- HEADER -->
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="pais">
                País
                <p-sortIcon field="pais"></p-sortIcon>
                <p-columnFilter field="pais" type="text" display="menu"></p-columnFilter>
              </th>

              <th pSortableColumn="nombre">
                Nombre del Gasto
                <p-sortIcon field="nombre"></p-sortIcon>
                <p-columnFilter field="nombre" type="text" display="menu"></p-columnFilter>
              </th>

              <th>
                Descripción
                <p-columnFilter field="descripcion" type="text" display="menu"></p-columnFilter>
              </th>

              <th pSortableColumn="monto">
                Monto
                <p-sortIcon field="monto"></p-sortIcon>
                <p-columnFilter field="monto" type="numeric" display="menu"></p-columnFilter>
              </th>

              <th>Acciones</th>
            </tr>
          </ng-template>

          <!-- BODY -->
          <ng-template pTemplate="body" let-gasto>
            <tr>
              <td><p-tag [value]="gasto.pais" severity="info"></p-tag></td>
              <td>{{ gasto.nombre }}</td>
              <td>{{ gasto.descripcion }}</td>
              <td class="font-bold text-right">
                {{ gasto.monto | currency:'USD':'symbol':'1.2-2':'es-US' }}
              </td>
              <td class="text-center">
                <p-button icon="pi pi-pencil"
                          (onClick)="editarGasto(gasto)"
                          styleClass="p-button-rounded p-button-warning p-button-text"></p-button>
                <p-button icon="pi pi-trash"
                          (onClick)="confirmarEliminarGasto(gasto)"
                          styleClass="p-button-rounded p-button-danger p-button-text"></p-button>
              </td>
            </tr>
          </ng-template>

          <!-- EMPTY -->
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center p-4 text-gray-500">
                No hay gastos registrados.
              </td>
            </tr>
          </ng-template>

          <!-- SUMMARY -->
          <ng-template pTemplate="summary">
            <div class="flex justify-content-end text-lg font-semibold">
              Total: {{ totalGastos | currency:'USD':'symbol':'1.2-2':'es-US' }}
            </div>
          </ng-template>

        </p-table>
      </p-card>
    </div>

    <!-- DIALOG -->
    <p-dialog 
      header="{{ editando ? 'Editar Gasto' : 'Añadir Gasto' }}"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{width: '30vw'}"
      [breakpoints]="{'960px': '75vw'}">

      <div class="p-fluid">
        <div class="field">
          <label>País</label>
          <input pInputText [(ngModel)]="nuevoGasto.pais" placeholder="Ej: Perú" required />
        </div>
        <div class="field">
          <label>Nombre del gasto</label>
          <input pInputText [(ngModel)]="nuevoGasto.nombre" placeholder="Ej: Hotel Miramar" required />
        </div>
        <div class="field">
          <label>Descripción</label>
          <input pInputText [(ngModel)]="nuevoGasto.descripcion" placeholder="Ej: 3 noches con desayuno" required />
        </div>
        <div class="field">
          <label>Monto (USD)</label>
          <p-inputNumber [(ngModel)]="nuevoGasto.monto" mode="currency" currency="USD" locale="es-US" [min]="0"></p-inputNumber>
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

  @ViewChild('filterInput') filterInput!: ElementRef;

  gastos: Gasto[] = [];
  nuevoGasto: Gasto = this.resetGasto();
  displayDialog = false;
  editando = false;
  totalGastos = 0;
  nextId = 1;

  ngOnInit() {
    this.gastos = [
      { id: this.nextId++, pais: 'Perú', nombre: 'Hotel Miraflores', descripcion: '2 noches con desayuno', monto: 150 },
      { id: this.nextId++, pais: 'Chile', nombre: 'Transporte Urbano', descripcion: 'Tarjeta bip y metro', monto: 30 },
      { id: this.nextId++, pais: 'México', nombre: 'Comida Día 1', descripcion: 'Cena en restaurante local', monto: 25 }
    ];
    this.calcularTotal();
  }

  onGlobalFilter(event: Event, table: Table) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  resetGasto(): Gasto {
    return { id: 0, pais: '', nombre: '', descripcion: '', monto: 0 };
  }

  calcularTotal() {
    this.totalGastos = this.gastos.reduce((acc, g) => acc + g.monto, 0);
  }

  showNewExpenseDialog() {
    this.nuevoGasto = this.resetGasto();
    this.displayDialog = true;
    this.editando = false;
  }

  editarGasto(gasto: Gasto) {
    this.nuevoGasto = { ...gasto };
    this.displayDialog = true;
    this.editando = true;
  }

  guardarGasto() {
    if (!this.nuevoGasto.pais.trim() || !this.nuevoGasto.nombre.trim() || this.nuevoGasto.monto <= 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Completa todos los campos correctamente.' });
      return;
    }

    if (this.editando) {
      const index = this.gastos.findIndex(g => g.id === this.nuevoGasto.id);
      if (index >= 0) this.gastos[index] = { ...this.nuevoGasto };
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Gasto actualizado correctamente.' });
    } else {
      this.nuevoGasto.id = this.nextId++;
      this.gastos = [...this.gastos, this.nuevoGasto];
      this.messageService.add({ severity: 'success', summary: 'Añadido', detail: 'Gasto añadido correctamente.' });
    }

    this.displayDialog = false;
    this.calcularTotal();
  }

  confirmarEliminarGasto(gasto: Gasto) {
    this.confirmationService.confirm({
      message: `¿Deseas eliminar el gasto "${gasto.nombre}" de ${gasto.pais}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.eliminarGasto(gasto.id)
    });
  }

  eliminarGasto(id: number) {
    this.gastos = this.gastos.filter(g => g.id !== id);
    this.calcularTotal();
    this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Gasto eliminado correctamente.' });
  }
}
