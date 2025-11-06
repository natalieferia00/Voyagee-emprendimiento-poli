import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

export interface Presupuesto {
  pais: string;
  bandera: string;
  total: number;
}

@Component({
  selector: 'app-presupuesto',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    CardModule,
    CurrencyPipe,
    FormsModule,
    InputIconModule,
    IconFieldModule,
    ButtonModule,
    InputTextModule
  ],
  template: `
  <div class="p-5">
    <p-card header="Presupuesto por País" styleClass="shadow-3">
      <ng-template pTemplate="subtitle">
        Visualiza el presupuesto total por país, incluyendo su bandera.
      </ng-template>

      <!-- Buscador -->
      <div class="flex justify-content-between align-items-center mb-3 p-3 border-round surface-100 border-1 surface-border">
        <div class="flex align-items-center gap-3">
          <p-button label="Añadir País" icon="pi pi-plus" (onClick)="agregarPais()" styleClass="p-button-success"></p-button>
        </div>

        <p-iconfield iconPosition="left">
          <p-inputicon><i class="pi pi-search"></i></p-inputicon>
          <input pInputText type="text" placeholder="Buscar país..." (input)="filtrar($event)" />
        </p-iconfield>
      </div>

      <!-- Tabla -->
      <p-table 
        [value]="presupuestosFiltrados" 
        dataKey="pais" 
        [rows]="10" 
        [paginator]="true"
        [showGridlines]="true"
        styleClass="p-datatable-sm p-datatable-gridlines shadow-1"
        responsiveLayout="scroll">

        <ng-template pTemplate="header">
          <tr>
            <th style="width:15%">Bandera</th>
            <th pSortableColumn="pais" style="width:45%">País <p-sortIcon field="pais"></p-sortIcon></th>
            <th pSortableColumn="total" style="width:40%">Presupuesto Total <p-sortIcon field="total"></p-sortIcon></th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-p>
          <tr>
            <td class="text-center">
              <img [src]="p.bandera" [alt]="p.pais" width="40" height="28" style="border-radius: 4px; box-shadow: 0 0 2px rgba(0,0,0,0.2);" />
            </td>
            <td>{{ p.pais }}</td>
            <td class="font-bold text-right">{{ p.total | currency:'USD':'symbol':'1.2-2':'es-US' }}</td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="3" class="text-center p-4 text-gray-500">No hay presupuestos registrados.</td>
          </tr>
        </ng-template>

        <ng-template pTemplate="summary">
          <div class="flex justify-content-end text-lg font-semibold">
            Total General: {{ totalGeneral | currency:'USD':'symbol':'1.2-2':'es-US' }}
          </div>
        </ng-template>
      </p-table>
    </p-card>
  </div>
  `
})
export class PresupuestoComponent implements OnInit {
  presupuestos: Presupuesto[] = [];
  presupuestosFiltrados: Presupuesto[] = [];
  totalGeneral: number = 0;

  ngOnInit() {
    // Datos de ejemplo
    this.presupuestos = [
      { pais: 'Perú', bandera: 'https://flagcdn.com/w40/pe.png', total: 1200 },
      { pais: 'Chile', bandera: 'https://flagcdn.com/w40/cl.png', total: 900 },
      { pais: 'México', bandera: 'https://flagcdn.com/w40/mx.png', total: 1500 }
    ];
    this.presupuestosFiltrados = [...this.presupuestos];
    this.calcularTotal();
  }

  calcularTotal() {
    this.totalGeneral = this.presupuestosFiltrados.reduce((sum, p) => sum + p.total, 0);
  }

  filtrar(event: Event) {
    const valor = (event.target as HTMLInputElement).value.toLowerCase();
    this.presupuestosFiltrados = this.presupuestos.filter(p =>
      p.pais.toLowerCase().includes(valor)
    );
    this.calcularTotal();
  }

  agregarPais() {
    const nuevoPais: Presupuesto = {
      pais: 'Colombia',
      bandera: 'https://flagcdn.com/w40/co.png',
      total: Math.floor(Math.random() * 1000) + 500
    };
    this.presupuestos = [...this.presupuestos, nuevoPais];
    this.presupuestosFiltrados = [...this.presupuestos];
    this.calcularTotal();
  }
}
