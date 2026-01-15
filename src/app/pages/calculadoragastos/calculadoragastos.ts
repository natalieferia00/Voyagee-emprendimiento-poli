import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';

@Component({
    selector: 'app-calculadora-gastos',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, 
        InputTextModule, InputNumberModule, DialogModule, 
        ToastModule, ConfirmDialogModule, TagModule, TooltipModule, SelectModule
    ],
    providers: [MessageService, ConfirmationService, CurrencyPipe],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>
        
        <div class="card p-4">
            <h5 class="text-2xl font-bold mb-6 text-slate-800">Centro de Control Presupuestario</h5>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200">
                <div class="flex flex-col border-r border-slate-100 pr-4">
                    <label class="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">Presupuesto Global</label>
                    <p-inputNumber [(ngModel)]="presupuestoGlobal" (onBlur)="actualizarTodo()" mode="currency" currency="USD" locale="en-US" styleClass="w-full" inputStyleClass="text-xl font-bold border-none p-0 focus:ring-0"></p-inputNumber>
                </div>
                <div class="flex flex-col border-r border-slate-100 px-4">
                    <span class="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">Total Invertido</span>
                    <span class="text-2xl font-black" [ngClass]="{'text-red-500': totalGastado > presupuestoGlobal, 'text-emerald-600': totalGastado <= presupuestoGlobal}">
                        {{ totalGastado | currency:'USD' }}
                    </span>
                </div>
                <div class="flex flex-col pl-4">
                    <span class="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">Estado del Fondo</span>
                    <div class="flex items-center gap-2">
                        <p-tag [severity]="totalGastado > presupuestoGlobal ? 'danger' : 'success'" 
                               [value]="((presupuestoGlobal - totalGastado) | currency:'USD') ?? ''" styleClass="text-lg px-4 py-2 rounded-lg font-bold"></p-tag>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div class="flex justify-between items-center p-4 bg-slate-50 border-b border-slate-200">
                    <h6 class="m-0 font-bold text-slate-700">Desglose por Destinos</h6>
                    <p-button label="Nuevo Destino" icon="pi pi-map" severity="primary" size="small" (onClick)="displayDestino = true"></p-button>
                </div>

                <p-table [value]="destinos" responsiveLayout="scroll" styleClass="p-datatable-sm">
                    <ng-template pTemplate="header">
                        <tr class="text-slate-400 text-xs uppercase">
                            <th class="py-4">Ciudad / Destino</th>
                            <th>Inversión Acumulada</th>
                            <th class="text-center">Detalle</th>
                            <th class="text-right pr-4">Acciones</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-d>
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="font-bold text-slate-700 text-lg">{{d.nombre}}</td>
                            <td>
                                <span class="text-emerald-600 font-bold text-lg">
                                    {{sumarGastos(d) | currency:'USD'}}
                                </span>
                            </td>
                            <td class="text-center">
                                <p-button icon="pi pi-eye" [rounded]="true" [text]="true" severity="info" 
                                          (onClick)="verDetalleDestino(d)" pTooltip="Ver detalle"></p-button>
                            </td>
                            <td class="text-right pr-4">
                                <div class="flex justify-end gap-1">
                                    <p-button icon="pi pi-plus-circle" severity="success" [text]="true" (onClick)="abrirGasto(d)" pTooltip="Gasto Manual"></p-button>
                                    <p-button icon="pi pi-trash" severity="danger" [text]="true" (onClick)="eliminarDestino(d)"></p-button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="4" class="text-center p-4 text-slate-500 font-medium">
                                No hay destinos registrados.
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <p-dialog [header]="'Gastos en ' + (destinoActual?.nombre || '')" [(visible)]="displayDetalle" [modal]="true" [style]="{width: '500px'}">
            <p-table [value]="destinoActual?.gastos || []" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                    <tr class="text-xs">
                        <th>Categoría</th>
                        <th>Descripción</th>
                        <th class="text-right">Monto</th>
                        <th style="width: 3rem"></th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-g let-index="rowIndex">
                    <tr>
                        <td><p-tag [value]="g.categoria" [severity]="getSeverity(g.categoria)"></p-tag></td>
                        <td class="text-xs italic text-slate-600">{{g.descripcion}}</td>
                        <td class="text-right font-bold">{{g.monto | currency:'USD'}}</td>
                        <td>
                            <p-button icon="pi pi-times" [text]="true" severity="danger" (onClick)="eliminarGastoIndividual(index)"></p-button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
            <div class="flex justify-between mt-6 p-4 bg-slate-50 rounded-lg font-bold">
                <span>Total del Destino:</span>
                <span class="text-emerald-600 text-xl">{{ sumarGastos(destinoActual) | currency:'USD' }}</span>
            </div>
        </p-dialog>

        <p-dialog header="Registrar Gasto" [(visible)]="displayGasto" [modal]="true" [style]="{width: '350px'}">
            <div class="flex flex-col gap-4 p-fluid pt-2">
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-bold uppercase text-slate-500">Categoría</label>
                    <p-select [options]="categorias" [(ngModel)]="tempGasto.categoria" optionLabel="label" optionValue="value" appendTo="body"></p-select>
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-bold uppercase text-slate-500">Descripción</label>
                    <input pInputText [(ngModel)]="tempGasto.descripcion" placeholder="Ej: Taxi">
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-bold uppercase text-slate-500">Monto</label>
                    <p-inputNumber [(ngModel)]="tempGasto.monto" mode="currency" currency="USD" locale="en-US" autofocus></p-inputNumber>
                </div>
                <p-button label="Guardar" severity="success" (onClick)="guardarGasto()"></p-button>
            </div>
        </p-dialog>

        <p-dialog header="Nuevo Destino" [(visible)]="displayDestino" [modal]="true" [style]="{width: '300px'}">
            <div class="flex flex-col gap-4 p-fluid pt-2">
                <input pInputText [(ngModel)]="tempDestino.nombre" placeholder="Nombre de la ciudad" (keyup.enter)="guardarDestino()">
                <p-button label="Crear" (onClick)="guardarDestino()"></p-button>
            </div>
        </p-dialog>
    `
})
export class CalculadoraGastosComponent implements OnInit {
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    
    destinos: any[] = [];
    presupuestoGlobal: number = 0;
    totalGastado: number = 0;
    
    displayDestino = false;
    displayGasto = false;
    displayDetalle = false;
    destinoActual: any = null;
    
    tempDestino = { nombre: '' };
    tempGasto: any = { categoria: 'Vuelos', monto: 0, descripcion: '' };

    categorias = [
        { label: 'Tiquetes', value: 'Vuelos' },
        { label: 'Hospedaje', value: 'Hospedaje' },
        { label: 'Comida', value: 'Comida' },
        { label: 'Transporte', value: 'Transporte' },
        { label: 'Otros', value: 'Otros' }
    ];

    private readonly LS_KEY_DATA = 'mis_destinos_data_v2';
    private readonly LS_KEY_GLOBAL = 'mi_presupuesto_global';
    private readonly LS_KEY_SYNC = 'app_presupuesto_sync';

    @HostListener('window:storage')
    onExternalUpdate() { this.loadInitialData(); }

    ngOnInit() { this.loadInitialData(); }

    loadInitialData() {
        const savedData = localStorage.getItem(this.LS_KEY_DATA);
        const savedGlobal = localStorage.getItem(this.LS_KEY_GLOBAL) || '0';
        this.destinos = savedData ? JSON.parse(savedData) : [];
        this.presupuestoGlobal = JSON.parse(savedGlobal);
        this.recalcularTotales();
    }


actualizarTodo() {
    localStorage.setItem(this.LS_KEY_DATA, JSON.stringify(this.destinos));
    localStorage.setItem(this.LS_KEY_GLOBAL, JSON.stringify(this.presupuestoGlobal));
    
    this.recalcularTotales();
    
  
    window.dispatchEvent(new Event('storage'));
    
 
    window.dispatchEvent(new Event('local-data-updated'));
}

recalcularTotales() {
    this.totalGastado = this.destinos.reduce((acc, d) => acc + this.sumarGastos(d), 0);
    
    const suma = (cat: string) => this.destinos.reduce((acc, d) => 
        acc + (d.gastos || []).filter((g: any) => g.categoria === cat)
        .reduce((s: number, g: any) => s + g.monto, 0), 0);

 
    const dataWidget = [
        { nombre: 'Tiquetes', color: 'bg-orange-500', gastado: suma('Vuelos'), total: this.presupuestoGlobal * 0.4 },
        { nombre: 'Hospedaje', color: 'bg-purple-500', gastado: suma('Hospedaje'), total: this.presupuestoGlobal * 0.3 },
        { nombre: 'Alimentación', color: 'bg-emerald-500', gastado: suma('Comida'), total: this.presupuestoGlobal * 0.2 },
        { nombre: 'Otros/Transp.', color: 'bg-slate-500', gastado: suma('Otros') + suma('Transporte'), total: this.presupuestoGlobal * 0.1 }
    ];

    localStorage.setItem(this.LS_KEY_SYNC, JSON.stringify(dataWidget));
}
    verDetalleDestino(d: any) {
        this.destinoActual = d;
        this.displayDetalle = true;
    }

    eliminarGastoIndividual(index: number) {
        this.destinoActual.gastos.splice(index, 1);
        this.actualizarTodo();
    }

    guardarDestino() {
        if (!this.tempDestino.nombre.trim()) return;
        this.destinos = [...this.destinos, { ...this.tempDestino, id: Date.now(), gastos: [] }];
        this.tempDestino = { nombre: '' };
        this.displayDestino = false;
        this.actualizarTodo();
    }

    abrirGasto(d: any) { 
        this.destinoActual = d; 
        this.tempGasto = { categoria: 'Vuelos', monto: 0, descripcion: '' };
        this.displayGasto = true; 
    }

    guardarGasto() {
        if (this.tempGasto.monto <= 0 || !this.destinoActual) return;
        this.destinoActual.gastos.push({ ...this.tempGasto, id: Date.now() });
        this.destinos = [...this.destinos];
        this.displayGasto = false;
        this.actualizarTodo();
    }

    eliminarDestino(d: any) {
        this.confirmationService.confirm({
            message: `¿Eliminar "${d.nombre}"?`,
            header: 'Confirmar eliminación',
            accept: () => {
                this.destinos = this.destinos.filter(x => x.id !== d.id);
                this.actualizarTodo();
            }
        });
    }

    sumarGastos(d: any) { 
        return (d?.gastos || []).reduce((acc: number, g: any) => acc + g.monto, 0); 
    }

    getSeverity(cat: string) {
        switch(cat) {
            case 'Vuelos': return 'warn';
            case 'Comida': return 'info';
            case 'Hospedaje': return 'success';
            case 'Transporte': return 'secondary';
            default: return 'contrast';
        }
    }
}