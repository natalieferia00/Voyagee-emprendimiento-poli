import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';

/* PrimeNG */
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-calculadora-gastos',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, InputNumberModule, DialogModule, ToastModule, ConfirmDialogModule, TagModule],
    providers: [MessageService, ConfirmationService, CurrencyPipe],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>
        
        <div class="card">
            <h5 class="text-xl font-bold mb-4">Control de Presupuesto General</h5>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-surface-50 dark:bg-surface-900 p-4 rounded-xl border border-surface">
                <div class="flex flex-col">
                    <label class="text-sm font-medium mb-1">Presupuesto Global</label>
                    <p-inputNumber [(ngModel)]="presupuestoGlobal" (onBlur)="actualizarTodo()" mode="currency" currency="USD" placeholder="Ejem: 5000"></p-inputNumber>
                </div>
                <div class="flex flex-col">
                    <span class="text-sm font-medium mb-1">Total Gastado</span>
                    <span class="text-2xl font-bold" [ngClass]="{'text-red-500': totalGastado > presupuestoGlobal}">
                        {{ totalGastado | currency:'USD' }}
                    </span>
                </div>
                <div class="flex flex-col">
                    <span class="text-sm font-medium mb-1">Balance</span>
                    <p-tag [severity]="totalGastado > presupuestoGlobal ? 'danger' : 'success'" 
                           [value]="((presupuestoGlobal - totalGastado) | currency:'USD') ?? ''" styleClass="text-lg"></p-tag>
                </div>
            </div>

            <div class="flex justify-between items-center mb-4">
                <h6 class="m-0 font-bold">Destinos y Desglose</h6>
                <p-button label="Nuevo Destino" icon="pi pi-plus" size="small" (onClick)="displayDestino = true"></p-button>
            </div>

            <p-table [value]="destinos" responsiveLayout="scroll" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Destino</th>
                        <th>Gasto Acumulado</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-d>
                    <tr>
                        <td class="font-bold">{{d.nombre}}</td>
                        <td class="text-primary font-bold">{{sumarGastos(d) | currency:'USD'}}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button icon="pi pi-plus" styleClass="p-button-success p-button-sm p-button-text" (onClick)="abrirGasto(d)"></p-button>
                                <p-button icon="pi pi-trash" styleClass="p-button-danger p-button-sm p-button-text" (onClick)="eliminarDestino(d)"></p-button>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog header="Agregar Destino" [(visible)]="displayDestino" [modal]="true" [style]="{width: '300px'}">
            <div class="flex flex-col gap-3 p-fluid">
                <input pInputText [(ngModel)]="tempDestino.nombre" placeholder="Nombre Destino">
                <p-button label="Guardar" (onClick)="guardarDestino()"></p-button>
            </div>
        </p-dialog>

        <p-dialog header="Añadir Gasto" [(visible)]="displayGasto" [modal]="true" [style]="{width: '300px'}">
            <div class="flex flex-col gap-3 p-fluid">
                <select class="p-inputtext" [(ngModel)]="tempGasto.categoria">
                    <option value="Vuelos">Tiquetes</option>
                    <option value="Comida">Alimentación</option>
                    <option value="Hospedaje">Hospedaje</option>
                    <option value="Otros">Seguros/Otros</option>
                </select>
                <p-inputNumber [(ngModel)]="tempGasto.monto" mode="currency" currency="USD" placeholder="Monto"></p-inputNumber>
                <p-button label="Registrar Gasto" (onClick)="guardarGasto()"></p-button>
            </div>
        </p-dialog>
    `
})
export class CalculadoraGastosComponent implements OnInit {
    private confirmationService = inject(ConfirmationService);
    
    destinos: any[] = [];
    presupuestoGlobal: number = 0;
    totalGastado: number = 0;
    
    displayDestino = false;
    displayGasto = false;
    destinoActual: any = null;
    
    tempDestino = { nombre: '' };
    tempGasto = { categoria: 'Vuelos', monto: 0 };

    private readonly LS_KEY_DATA = 'mis_destinos_data_v2';
    private readonly LS_KEY_GLOBAL = 'mi_presupuesto_global';
    private readonly LS_KEY_SYNC = 'app_presupuesto_sync';

    ngOnInit() {
        // ✅ CORRECCIÓN: Usar ?? '' para evitar el error de string | null
        const savedData = localStorage.getItem(this.LS_KEY_DATA) ?? '';
        const savedGlobal = localStorage.getItem(this.LS_KEY_GLOBAL) ?? '0';
        
        if (savedData) this.destinos = JSON.parse(savedData);
        this.presupuestoGlobal = JSON.parse(savedGlobal);
        
        this.recalcularYNotificar();
    }

    guardarDestino() {
        if (!this.tempDestino.nombre) return;
        this.destinos = [...this.destinos, { ...this.tempDestino, id: Date.now(), gastos: [] }];
        this.tempDestino = { nombre: '' };
        this.displayDestino = false;
        this.actualizarTodo();
    }

    abrirGasto(d: any) { this.destinoActual = d; this.displayGasto = true; }

    guardarGasto() {
        if (this.tempGasto.monto <= 0 || !this.destinoActual) return;
        this.destinoActual.gastos.push({ ...this.tempGasto });
        this.destinos = [...this.destinos];
        this.tempGasto = { categoria: 'Vuelos', monto: 0 };
        this.displayGasto = false;
        this.actualizarTodo();
    }

    eliminarDestino(d: any) {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el destino ${d.nombre}?`,
            accept: () => {
                this.destinos = this.destinos.filter(x => x.id !== d.id);
                this.actualizarTodo();
            }
        });
    }

    actualizarTodo() {
        localStorage.setItem(this.LS_KEY_DATA, JSON.stringify(this.destinos));
        localStorage.setItem(this.LS_KEY_GLOBAL, JSON.stringify(this.presupuestoGlobal));
        this.recalcularYNotificar();
    }

    recalcularYNotificar() {
        this.totalGastado = this.destinos.reduce((acc, d) => acc + this.sumarGastos(d), 0);
        const suma = (cat: string) => this.destinos.reduce((acc, d) => 
            acc + (d.gastos || []).filter((g: any) => g.categoria === cat).reduce((s: number, g: any) => s + g.monto, 0), 0);

        const presupuestoPorCat = this.presupuestoGlobal / 4;

        const dataWidget = [
            { nombre: 'Tiquetes', color: 'bg-orange-500', gastado: suma('Vuelos'), total: presupuestoPorCat || 1 },
            { nombre: 'Alimentación', color: 'bg-cyan-500', gastado: suma('Comida'), total: presupuestoPorCat || 1 },
            { nombre: 'Hospedaje', color: 'bg-pink-500', gastado: suma('Hospedaje'), total: presupuestoPorCat || 1 },
            { nombre: 'Otros', color: 'bg-green-500', gastado: suma('Otros'), total: presupuestoPorCat || 1 }
        ];

        localStorage.setItem(this.LS_KEY_SYNC, JSON.stringify(dataWidget));
        window.dispatchEvent(new Event('storage'));
    }

    sumarGastos(d: any) { return (d.gastos || []).reduce((acc: number, g: any) => acc + g.monto, 0); }
} 