import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
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
import { CardModule } from 'primeng/card';

interface Gasto {
    id: number;
    categoria: string;
    descripcion: string;
    monto: number;
}

interface Destino {
    id: number;
    nombre: string;
    presupuestoAsignado: number;
    gastos: Gasto[];
}

@Component({
    selector: 'app-calculadora-gastos',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, 
        InputTextModule, InputNumberModule, DialogModule, 
        ToastModule, ConfirmDialogModule, TagModule, CardModule
    ],
    providers: [MessageService, ConfirmationService, CurrencyPipe],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <div class="p-4">
            <p-card header="Gestión de Presupuesto Viajero">
                <div class="flex mb-4">
                    <p-button label="Nuevo Destino" icon="pi pi-plus" (onClick)="showDestinoDialog()"></p-button>
                </div>

                <p-table [value]="destinos" styleClass="p-datatable-sm" [responsiveLayout]="'scroll'">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Destino</th>
                            <th>Presupuesto</th>
                            <th>Gastado</th>
                            <th>Balance</th>
                            <th style="width: 12rem" class="text-center">Acciones</th>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="body" let-destino>
                        <tr>
                            <td><span class="font-bold text-700">{{ destino.nombre }}</span></td>
                            <td>{{ destino.presupuestoAsignado | currency:'USD' }}</td>
                            <td class="text-primary font-bold">{{ calcularTotalDestino(destino) | currency:'USD' }}</td>
                            <td>
                                <p-tag [severity]="getBadgeSeverity(destino)" 
                                       [value]="(destino.presupuestoAsignado - calcularTotalDestino(destino) | currency:'USD') ?? ''">
                                </p-tag>
                            </td>
                            <td class="flex justify-content-center gap-2">
                                <p-button icon="pi pi-eye" styleClass="p-button-rounded p-button-text" (onClick)="verDetalle(destino)"></p-button>
                                <p-button icon="pi pi-plus" label="Gasto" styleClass="p-button-sm p-button-success" (onClick)="showGastoDialog(destino)"></p-button>
                                <p-button icon="pi pi-trash" styleClass="p-button-sm p-button-danger p-button-text" (onClick)="eliminarDestino(destino)"></p-button>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        </div>

        <p-dialog [header]="'Nuevo Gasto para ' + (destinoActual?.nombre ?? '')" [(visible)]="displayGastoDialog" [modal]="true" [style]="{width: '350px'}">
            <div class="p-fluid">
                <div class="field mb-3">
                    <label class="block font-bold mb-1">Categoría</label>
                    <select class="p-inputtext w-full" [(ngModel)]="nuevoGasto.categoria">
                        <option value="" disabled>Seleccione...</option>
                        <option *ngFor="let cat of opcionesCategorias" [value]="cat.value">{{ cat.label }}</option>
                    </select>
                </div>
                <div class="field mb-3">
                    <label class="block font-bold mb-1">Monto (USD)</label>
                    <p-inputNumber [(ngModel)]="nuevoGasto.monto" mode="currency" currency="USD" locale="en-US"></p-inputNumber>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Guardar" icon="pi pi-check" (onClick)="agregarGasto()"></p-button>
            </ng-template>
        </p-dialog>

        <p-dialog header="Registrar Destino" [(visible)]="displayDestinoDialog" [modal]="true" [style]="{width: '350px'}">
            <div class="p-fluid">
                <div class="field mb-3">
                    <label class="block font-bold mb-1">Nombre</label>
                    <input pInputText [(ngModel)]="nuevoDestino.nombre" />
                </div>
                <div class="field mb-3">
                    <label class="block font-bold mb-1">Presupuesto</label>
                    <p-inputNumber [(ngModel)]="nuevoDestino.presupuestoAsignado" mode="currency" currency="USD"></p-inputNumber>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Crear" icon="pi pi-check" (onClick)="agregarDestino()"></p-button>
            </ng-template>
        </p-dialog>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculadoraGastosComponent implements OnInit {
    private confirmationService = inject(ConfirmationService);
    private LS_KEY_CALC = 'viajes_v10_final';
    private LS_KEY_WIDGET = 'app_presupuesto_viaje';

    destinos: Destino[] = [];
    destinoActual?: Destino;
    displayDestinoDialog = false;
    displayGastoDialog = false;

    opcionesCategorias = [
        { label: 'Tiquetes', value: 'Vuelos' },
        { label: 'Alimentación', value: 'Comida' },
        { label: 'Hospedaje', value: 'Hospedaje' },
        { label: 'Seguros', value: 'Transporte' },
        { label: 'Equipaje', value: 'Otros' }
    ];

    nuevoDestino: Destino = { id: 0, nombre: '', presupuestoAsignado: 0, gastos: [] };
    nuevoGasto: Gasto = { id: 0, categoria: '', descripcion: '', monto: 0 };

    ngOnInit() { this.cargarDatos(); }

    private cargarDatos() {
        const stored = localStorage.getItem(this.LS_KEY_CALC);
        if (stored) this.destinos = JSON.parse(stored);
    }

    private guardarTodo() {
        localStorage.setItem(this.LS_KEY_CALC, JSON.stringify(this.destinos));
        this.sincronizarWidget();
    }

    private sincronizarWidget() {
        const categoriasMapa = [
            { nombre: 'Tiquetes', subtitulo: 'tiquetes de viaje', color: 'bg-orange-500', slug: 'Vuelos' },
            { nombre: 'Alimentacion', subtitulo: 'plan de comidas', color: 'bg-cyan-500', slug: 'Comida' },
            { nombre: 'Hospedaje', subtitulo: 'Hoteles, hostales, etc', color: 'bg-pink-500', slug: 'Hospedaje' },
            { nombre: 'Seguros', subtitulo: 'seguros de viaje', color: 'bg-green-500', slug: 'Transporte' },
            { nombre: 'Equipaje', subtitulo: 'checklist equipaje', color: 'bg-purple-500', slug: 'Otros' }
        ];

        const presupuestoTotal = this.destinos.reduce((acc, d) => acc + d.presupuestoAsignado, 0);
        const presupuestoPorCat = presupuestoTotal / categoriasMapa.length;

        const dataWidget = categoriasMapa.map(cat => {
            const gastado = this.destinos.reduce((acc, d) => {
                const sub = d.gastos.filter(g => g.categoria === cat.slug).reduce((s, g) => s + g.monto, 0);
                return acc + sub;
            }, 0);
            return {
                ...cat,
                gastado: gastado,
                total: presupuestoPorCat || 100
            };
        });

        localStorage.setItem(this.LS_KEY_WIDGET, JSON.stringify(dataWidget));
        window.dispatchEvent(new Event('storage'));
    }

    agregarDestino() {
        if (this.nuevoDestino.nombre) {
            this.destinos = [...this.destinos, { ...this.nuevoDestino, id: Date.now(), gastos: [] }];
            this.guardarTodo();
            this.displayDestinoDialog = false;
        }
    }

    agregarGasto() {
        if (this.destinoActual && this.nuevoGasto.monto > 0) {
            this.destinoActual.gastos.push({ ...this.nuevoGasto, id: Date.now() });
            this.destinos = [...this.destinos];
            this.guardarTodo();
            this.displayGastoDialog = false;
        }
    }

    // Funciones auxiliares
    calcularTotalDestino(d: Destino) { return d.gastos.reduce((acc, g) => acc + g.monto, 0); }
    getBadgeSeverity(d: Destino) { return (d.presupuestoAsignado - this.calcularTotalDestino(d)) < 0 ? 'danger' : 'success'; }
    showDestinoDialog() { this.nuevoDestino = { id: 0, nombre: '', presupuestoAsignado: 0, gastos: [] }; this.displayDestinoDialog = true; }
    showGastoDialog(d: Destino) { this.destinoActual = d; this.nuevoGasto = { id: 0, categoria: '', descripcion: '', monto: 0 }; this.displayGastoDialog = true; }
    eliminarDestino(d: Destino) { this.confirmationService.confirm({ message: '¿Eliminar?', accept: () => { this.destinos = this.destinos.filter(x => x.id !== d.id); this.guardarTodo(); } }); }
    verDetalle(d: any) { /* Implementar si se desea */ }
}