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

interface GastoAlimentacion {
    id?: number;
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
            <div class="font-semibold text-xl">Gestión de Alimentación y Gastos</div>
            <p-tag severity="contrast" [style]="{'font-size': '1.1rem', 'padding': '8px 15px'}" 
                   [value]="'Presupuesto Total: ' + (calcularTotal() | currency:'COP':'symbol':'1.0-0')" />
        </div>

        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Nuevo Gasto" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
            </ng-template>
        </p-toolbar>

        <p-table #dt [value]="gastos()" [rows]="10" [paginator]="true" [rowHover]="true" [showGridlines]="true">
            <ng-template #header>
                <tr>
                    <th>Descripción / Lugar</th>
                    <th>Categoría</th>
                    <th>Costo Estimado</th>
                    <th style="min-width: 12rem">Estado (Cambio Rápido)</th>
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
                        {{ gasto.costoEstimado | currency:'COP':'symbol':'1.0-0' }}
                    </td>
                    <td>
                        <p-select 
                            [(ngModel)]="gasto.estado" 
                            [options]="estados" 
                            (onChange)="onStatusChange(gasto)"
                            styleClass="w-full border-none bg-transparent shadow-none"
                            appendTo="body">
                            <ng-template #selectedItem let-selectedOption>
                                <p-tag [value]="selectedOption.label" [severity]="getSeverityStatus(selectedOption.value)" />
                            </ng-template>
                            <ng-template let-option #item>
                                <p-tag [value]="option.label" [severity]="getSeverityStatus(option.value)" />
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

        <p-dialog [(visible)]="gastoDialog" [style]="{ width: '550px' }" header="Detalles del Gasto" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-5 pt-2">
                    <div class="flex flex-col gap-2">
                        <label class="font-bold text-900">Lugar o Concepto</label>
                        <input type="text" pInputText [(ngModel)]="gasto.nombre" placeholder="Ej: Supermercado..." autofocus />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-900">Categoría</label>
                            <p-select [(ngModel)]="gasto.categoria" [options]="categorias" placeholder="Seleccionar" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-900">Estado</label>
                            <p-select [(ngModel)]="gasto.estado" [options]="estados" optionLabel="label" optionValue="value" placeholder="Seleccionar" />
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-900">Costo Estimado (COP)</label>
                            <p-inputnumber [(ngModel)]="gasto.costoEstimado" mode="currency" currency="COP" locale="es-CO" placeholder="$ 0" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-900">Valoración</label>
                            <div class="pt-2">
                                <p-rating [(ngModel)]="gasto.rating" />
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="font-bold text-900">URL / Menú / Ubicación</label>
                        <div class="p-inputgroup">
                            <span class="p-inputgroup-addon"><i class="pi pi-link"></i></span>
                            <input type="text" pInputText [(ngModel)]="gasto.url" placeholder="https://..." />
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="font-bold text-900">Notas Adicionales</label>
                        <textarea pTextarea [(ngModel)]="gasto.description" rows="4" style="resize: none" placeholder="Detalles..."></textarea>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <div class="flex justify-end gap-2">
                    <p-button label="Cancelar" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="hideDialog()" />
                    <p-button label="Guardar Gasto" icon="pi pi-check" severity="success" (onClick)="saveGasto()" />
                </div>
            </ng-template>
        </p-dialog>

        <p-dialog header="Vincular a Presupuesto" [(visible)]="destinosDialog" [modal]="true" [style]="{width: '400px'}">
            <div class="p-2">
                <p class="mb-4">Selecciona el destino para asignar este gasto de alimentación:</p>
                <p-select [options]="listaDestinos" [(ngModel)]="destinoSeleccionado" optionLabel="nombre" placeholder="Seleccionar destino" styleClass="w-full" appendTo="body" />
                <div class="flex justify-end mt-4">
                    <p-button label="Confirmar" (onClick)="confirmarVinculacion()" [disabled]="!destinoSeleccionado" />
                </div>
            </div>
        </p-dialog>
    </div>
    `
})
export class GestionAlimentacionComponent implements OnInit {
    gastos = signal<GastoAlimentacion[]>([]);
    gasto: GastoAlimentacion = {};
    gastoDialog: boolean = false;
    destinosDialog: boolean = false;
    listaDestinos: any[] = [];
    destinoSeleccionado: any = null;
    gastoPendiente: GastoAlimentacion | null = null;

    private readonly LS_ALIMENTACION = 'mis_gastos_alimentacion_v1';
    private readonly LS_CALC = 'mis_destinos_data_v2';

    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    categorias = ['Restaurante', 'Supermercado', 'Panadería', 'Calle / Snack', 'Otros'];
    
    estados = [
        { label: 'Visto', value: 'Visto' },
        { label: 'Reservado', value: 'Reservado' },
        { label: 'Pendiente', value: 'Pendiente' },
        { label: 'Descartado', value: 'Descartado' }
    ];

    @HostListener('window:storage')
    onExternalUpdate() { this.loadFromLocal(); }

    ngOnInit() { this.loadFromLocal(); }

    loadFromLocal() {
        const saved = localStorage.getItem(this.LS_ALIMENTACION);
        if (saved) {
            this.gastos.set(JSON.parse(saved));
        }
    }

    saveToLocal() {
        localStorage.setItem(this.LS_ALIMENTACION, JSON.stringify(this.gastos()));
    }

    onStatusChange(g: GastoAlimentacion) {
        if (g.estado === 'Reservado' && !g.registradoEnCalculadora) {
            this.abrirVinculacion(g);
        } else if (g.estado !== 'Reservado' && g.registradoEnCalculadora) {
            this.eliminarDeCalculadora(g);
        }
        this.saveToLocal();
    }

    abrirVinculacion(g: GastoAlimentacion) {
        const data = localStorage.getItem(this.LS_CALC);
        this.listaDestinos = data ? JSON.parse(data) : [];
        if (this.listaDestinos.length === 0) return;
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
                categoria: 'Alimentación',
                descripcion: `Alim: ${this.gastoPendiente.nombre}`,
                monto: this.gastoPendiente.costoEstimado || 0
            });
            localStorage.setItem(this.LS_CALC, JSON.stringify(dataCalc));
            window.dispatchEvent(new Event('storage'));
            
            this.gastoPendiente.registradoEnCalculadora = true;
            this.gastoPendiente.refGastoId = gastoId;
            this.saveToLocal();
            this.messageService.add({ severity: 'success', summary: 'Sincronizado', detail: 'Añadido al presupuesto' });
        }
        this.destinosDialog = false;
    }

    eliminarDeCalculadora(g: GastoAlimentacion) {
        if (!g.refGastoId) return;
        const dataCalc = JSON.parse(localStorage.getItem(this.LS_CALC) || '[]');
        dataCalc.forEach((dest: any) => {
            if (dest.gastos) dest.gastos = dest.gastos.filter((gas: any) => gas.id !== g.refGastoId);
        });
        localStorage.setItem(this.LS_CALC, JSON.stringify(dataCalc));
        window.dispatchEvent(new Event('storage'));
        g.registradoEnCalculadora = false;
        g.refGastoId = undefined;
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

    saveGasto() {
        if (this.gasto.nombre?.trim()) {
            let _gastos = [...this.gastos()];
            if (this.gasto.id) {
                const index = _gastos.findIndex(r => r.id === this.gasto.id);
                _gastos[index] = this.gasto;
            } else {
                this.gasto.id = Math.floor(Math.random() * 100000);
                _gastos.push(this.gasto);
            }
            this.gastos.set(_gastos);
            this.saveToLocal();
            this.gastoDialog = false;
            if (this.gasto.estado === 'Reservado') this.onStatusChange(this.gasto);
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro guardado' });
        }
    }

    deleteGasto(g: GastoAlimentacion) {
        this.confirmationService.confirm({
            message: `¿Eliminar ${g.nombre}?`,
            accept: () => {
                this.eliminarDeCalculadora(g);
                this.gastos.set(this.gastos().filter((val) => val.id !== g.id));
                this.saveToLocal();
                this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Registro borrado' });
            }
        });
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