import { Component, OnInit, signal, HostListener, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

// Servicio
import { FoodService } from '../service/food.service';

interface GastoAlimentacion {
    id?: string | number;
    _id?: string;
    nombre?: string;
    categoria?: string; 
    rating?: number;
    costoEstimado?: number;
    description?: string;
    url?: string;
    estado?: string;
    registradoEnCalculadora?: boolean;
    refGastoId?: number;
}

@Component({
    selector: 'app-gestion-alimentacion',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, TagModule, RatingModule,
        InputTextModule, ButtonModule, ToolbarModule, DialogModule,
        SelectModule, InputNumberModule, TextareaModule, ConfirmDialogModule, ToastModule
    ],
    providers: [ConfirmationService, MessageService, CurrencyPipe],
    template: `
    <p-toast />
    <p-confirmdialog />

    <div class="card">
        <div class="flex justify-between items-center mb-4">
            <div class="font-semibold text-xl text-800">Gestión de Alimentación y Gastos</div>
            <p-tag severity="contrast" [style]="{'font-size': '1.1rem', 'padding': '8px 15px'}" 
                   [value]="'Inversión Total: ' + (calcularTotal() | currency:'USD':'symbol':'1.0-0')" />
        </div>

        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Nuevo Gasto" icon="pi pi-plus" severity="success" (onClick)="openNew()" />
            </ng-template>
        </p-toolbar>

        <p-table [value]="gastos()" [rows]="10" [paginator]="true" [rowHover]="true" responsiveLayout="scroll">
            <ng-template #header>
                <tr>
                    <th>Lugar / Concepto</th>
                    <th>Categoría</th>
                    <th>Costo Estimado</th>
                    <th style="min-width: 12rem">Estado</th>
                    <th>Valoración</th>
                    <th style="width: 8rem">Acciones</th>
                </tr>
            </ng-template>

            <ng-template #body let-gasto>
                <tr>
                    <td>
                        <div class="font-bold text-800">{{ gasto.nombre }}</div>
                        <a *ngIf="gasto.url" [href]="gasto.url" target="_blank" class="text-xs text-blue-500 hover:underline flex items-center gap-1">
                            <i class="pi pi-external-link" style="font-size: 0.7rem"></i> Ver Referencia
                        </a>
                    </td>
                    <td>
                        <p-tag [value]="gasto.categoria" [severity]="getSeverityCategoria(gasto.categoria)" />
                    </td>
                    <td class="font-semibold text-primary">
                        {{ gasto.costoEstimado | currency:'USD':'symbol':'1.0-0' }}
                    </td>
                    <td>
                        <p-select 
                            [(ngModel)]="gasto.estado" 
                            [options]="estados" 
                            optionLabel="label" 
                            optionValue="value"
                            (onChange)="onStatusChange(gasto)"
                            styleClass="w-full border-none bg-transparent shadow-none"
                            appendTo="body">
                            <ng-template #selectedItem let-selectedOption>
                                <p-tag [value]="selectedOption.label" [severity]="getSeverityStatus(selectedOption.value)" />
                            </ng-template>
                        </p-select>
                    </td>
                    <td><p-rating [ngModel]="gasto.rating" [readonly]="true" /></td>
                    <td>
                        <div class="flex gap-2">
                            <p-button icon="pi pi-pencil" [rounded]="true" [outlined]="true" severity="info" (onClick)="editGasto(gasto)" />
                            <p-button icon="pi pi-trash" [rounded]="true" [outlined]="true" severity="danger" (onClick)="deleteGasto(gasto)" />
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog header="Vincular a Presupuesto" [(visible)]="destinosDialog" [modal]="true" [style]="{width: '400px'}">
            <div class="flex flex-col gap-4">
                <p class="text-sm">Has marcado este gasto como <b>Reservado/Confirmado</b>. ¿A qué destino pertenece?</p>
                <p-select [options]="listaDestinos" [(ngModel)]="destinoSeleccionado" optionLabel="nombre" placeholder="Seleccionar destino" styleClass="w-full" appendTo="body" />
                <p-button label="Confirmar Sincronización" icon="pi pi-sync" (onClick)="confirmarVinculacion()" [disabled]="!destinoSeleccionado" severity="success" />
            </div>
        </p-dialog>

        <p-dialog [(visible)]="gastoDialog" [style]="{ width: '550px' }" header="Detalles del Gasto" [modal]="true" styleClass="p-fluid">
            <div class="flex flex-col gap-5 pt-2">
                <div class="flex flex-col gap-2">
                    <label class="font-bold text-sm">Lugar o Concepto</label>
                    <input type="text" pInputText [(ngModel)]="gasto.nombre" placeholder="Ej: Restaurante Central..." />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-bold text-sm">Categoría</label>
                        <p-select [(ngModel)]="gasto.categoria" [options]="categorias" placeholder="Seleccionar" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-bold text-sm">Estado</label>
                        <p-select [(ngModel)]="gasto.estado" [options]="estados" optionLabel="label" optionValue="value" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-bold text-sm">Costo Estimado (USD)</label>
                        <p-inputnumber [(ngModel)]="gasto.costoEstimado" mode="currency" currency="USD" locale="en-US" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-bold text-sm">Valoración Personal</label>
                        <div class="pt-2">
                            <p-rating [(ngModel)]="gasto.rating" />
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="font-bold text-sm">URL Referencia / Ubicación</label>
                    <input type="text" pInputText [(ngModel)]="gasto.url" />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="font-bold text-sm">Notas / Qué pedir</label>
                    <textarea pTextarea [(ngModel)]="gasto.description" rows="3"></textarea>
                </div>
            </div>

            <ng-template #footer>
                <p-button label="Cancelar" [text]="true" severity="secondary" (onClick)="hideDialog()" />
                <p-button label="Guardar Registro" icon="pi pi-save" severity="success" (onClick)="saveGasto()" />
            </ng-template>
        </p-dialog>
    </div>
    `
})
export class GestionAlimentacionComponent implements OnInit {
    private foodService = inject(FoodService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    gastos = signal<GastoAlimentacion[]>([]);
    gasto: GastoAlimentacion = {};
    gastoDialog: boolean = false;
    destinosDialog: boolean = false;
    listaDestinos: any[] = [];
    destinoSeleccionado: any = null;
    gastoPendiente: GastoAlimentacion | null = null;

    private readonly LS_CALC = 'mis_destinos_data_v2';

    categorias = ['Restaurante', 'Supermercado', 'Panadería', 'Calle / Snack', 'Otros'];
    
    estados = [
        { label: 'Visto', value: 'Visto' },
        { label: 'Reservado', value: 'Reservado' },
        { label: 'Pendiente', value: 'Pendiente' },
        { label: 'Descartado', value: 'Descartado' }
    ];

    ngOnInit() { this.loadData(); }

    loadData() {
        this.foodService.getFoods().subscribe({
            next: (data) => {
                this.gastos.set(data.map(f => ({ ...f, id: f._id })));
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos' })
        });
    }

    saveGasto() {
        if (!this.gasto.nombre) return;

        const body = { ...this.gasto, _id: this.gasto.id };
        
        this.foodService.saveFood(body).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro guardado en la nube' });
                this.loadData();
                
                // Lógica de sincronización con calculadora
                if (this.gasto.estado === 'Reservado' && !this.gasto.registradoEnCalculadora) {
                    this.abrirVinculacion({ ...this.gasto, id: res._id });
                } else if (this.gasto.estado !== 'Reservado' && this.gasto.registradoEnCalculadora) {
                    this.eliminarDeCalculadora(this.gasto);
                }
                
                this.gastoDialog = false;
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al conectar con el servidor' })
        });
    }

    onStatusChange(g: GastoAlimentacion) {
        if (g.estado === 'Reservado' && !g.registradoEnCalculadora) {
            this.abrirVinculacion(g);
        } else if (g.estado !== 'Reservado' && g.registradoEnCalculadora) {
            this.eliminarDeCalculadora(g);
        }
        
        this.foodService.saveFood({ ...g, _id: g.id }).subscribe();
    }

    abrirVinculacion(g: GastoAlimentacion) {
        const data = localStorage.getItem(this.LS_CALC);
        this.listaDestinos = data ? JSON.parse(data) : [];
        
        if (this.listaDestinos.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Crea un destino en la Calculadora primero' });
            g.estado = 'Visto';
            return;
        }
        this.gastoPendiente = g;
        this.destinosDialog = true;
    }

    confirmarVinculacion() {
        if (!this.gastoPendiente || !this.destinoSeleccionado) return;
        
        const dataCalc = JSON.parse(localStorage.getItem(this.LS_CALC) || '[]');
        const idx = dataCalc.findIndex((d: any) => d.id === this.destinoSeleccionado.id);
        
        if (idx !== -1) {
            const gastoId = Date.now();
            if (!dataCalc[idx].gastos) dataCalc[idx].gastos = [];
            
            dataCalc[idx].gastos.push({
                id: gastoId,
                refId: this.gastoPendiente.id,
                categoria: 'Alimentación',
                descripcion: `Alim: ${this.gastoPendiente.nombre}`,
                monto: this.gastoPendiente.costoEstimado || 0
            });
            
            localStorage.setItem(this.LS_CALC, JSON.stringify(dataCalc));
            window.dispatchEvent(new Event('storage'));
            
            this.gastoPendiente.registradoEnCalculadora = true;
            this.gastoPendiente.refGastoId = gastoId;
            
            this.foodService.saveFood({ ...this.gastoPendiente, _id: this.gastoPendiente.id }).subscribe();
            this.messageService.add({ severity: 'success', summary: 'Sincronizado', detail: 'Añadido al presupuesto' });
        }
        this.destinosDialog = false;
    }

    eliminarDeCalculadora(g: GastoAlimentacion) {
        const dataCalc = JSON.parse(localStorage.getItem(this.LS_CALC) || '[]');
        let huboCambio = false;

        dataCalc.forEach((dest: any) => {
            if (dest.gastos) {
                const lenOriginal = dest.gastos.length;
                dest.gastos = dest.gastos.filter((gas: any) => gas.refId !== g.id && gas.id !== g.refGastoId);
                if (dest.gastos.length !== lenOriginal) huboCambio = true;
            }
        });

        if (huboCambio) {
            localStorage.setItem(this.LS_CALC, JSON.stringify(dataCalc));
            window.dispatchEvent(new Event('storage'));
        }
        g.registradoEnCalculadora = false;
        g.refGastoId = undefined;
    }

    deleteGasto(g: GastoAlimentacion) {
        this.confirmationService.confirm({
            message: `¿Eliminar "${g.nombre}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.foodService.deleteFood(g.id!.toString()).subscribe(() => {
                    this.eliminarDeCalculadora(g);
                    this.loadData();
                    this.messageService.add({ severity: 'info', summary: 'Borrado', detail: 'Registro eliminado' });
                });
            }
        });
    }

    calcularTotal() {
        return this.gastos().reduce((acc, g) => acc + (g.costoEstimado || 0), 0);
    }

    openNew() {
        this.gasto = { rating: 0, estado: 'Visto', categoria: 'Restaurante', costoEstimado: 0 };
        this.gastoDialog = true;
    }

    editGasto(g: GastoAlimentacion) {
        this.gasto = { ...g };
        this.gastoDialog = true;
    }

    hideDialog() { this.gastoDialog = false; }

    getSeverityStatus(status: any): any {
        const map: any = { 'Reservado': 'success', 'Pendiente': 'warn', 'Visto': 'info', 'Descartado': 'danger' };
        return map[status] || 'secondary';
    }

    getSeverityCategoria(cat: any): any {
        const map: any = { 'Restaurante': 'info', 'Supermercado': 'success', 'Panadería': 'secondary', 'Calle / Snack': 'warn' };
        return map[cat] || 'secondary';
    }
}