import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';

export interface Product {
    id?: string;
    name?: string;
    description?: string;
    price?: number;
    inventoryStatus?: string;
    rating?: number;
    URL?: string;
    tipoAlojamiento?: string;
    registradoEnCalculadora?: boolean;
}

@Component({
    selector: 'app-crud',
    standalone: true,
    imports: [
        CommonModule, TableModule, FormsModule, ButtonModule, RippleModule,
        ToastModule, ToolbarModule, RatingModule, InputTextModule,
        TextareaModule, SelectModule, RadioButtonModule, InputNumberModule,
        DialogModule, TagModule, InputIconModule, IconFieldModule, 
        ConfirmDialogModule, TooltipModule
    ],
    providers: [MessageService, ConfirmationService, CurrencyPipe],
    template: `
        <p-toast />
        <p-confirmdialog />

        <div class="card">
            <div class="flex justify-between items-center mb-4">
                <div class="font-semibold text-xl text-800">Gestión de Alojamientos</div>
                <p-tag severity="contrast" [style]="{'font-size': '1.1rem', 'padding': '8px 15px'}" 
                       [value]="'Inversión Total: ' + (calcularTotal() | currency:'USD':'symbol':'1.0-2')" />
            </div>

            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <p-button label="Nuevo Alojamiento" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                    <p-button severity="danger" label="Eliminar Seleccionados" icon="pi pi-trash" outlined (onClick)="deleteSelectedProducts()" [disabled]="!selectedProducts || !selectedProducts.length" />
                </ng-template>

                <ng-template #end>
                    <p-button label="Exportar" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
                </ng-template>
            </p-toolbar>

            <p-table #dt [value]="products()" [rows]="10" [paginator]="true" [globalFilterFields]="['name', 'tipoAlojamiento', 'inventoryStatus']"
                [tableStyle]="{ 'min-width': '75rem' }" [(selection)]="selectedProducts" [rowHover]="true" dataKey="id">
                
                <ng-template #caption>
                    <div class="flex items-center justify-between">
                        <h5 class="m-0 text-700">Listado de Opciones</h5>
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar alojamiento..." />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template #header>
                    <tr>
                        <th style="width: 3rem"><p-tableHeaderCheckbox /></th>
                        <th>Nombre / Link</th>
                        <th class="text-center">Detalles</th> 
                        <th>Precio</th>
                        <th>Tipo</th>
                        <th>Puntuación</th>
                        <th style="min-width: 14rem">Estado</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>

                <ng-template #body let-product>
                    <tr>
                        <td><p-tableCheckbox [value]="product" /></td>
                        <td>
                            <div class="font-bold text-800">{{ product.name }}</div>
                            <a *ngIf="product.URL" [href]="product.URL" target="_blank" class="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                <i class="pi pi-external-link" style="font-size: 0.7rem"></i> Visitar Web
                            </a>
                        </td>
                        <td class="text-center">
                            <i *ngIf="product.description" class="pi pi-eye text-primary cursor-pointer text-xl" [pTooltip]="product.description" tooltipPosition="top"></i>
                            <i *ngIf="!product.description" class="pi pi-eye-slash text-300"></i>
                        </td>
                        <td class="font-medium text-primary">{{ product.price | currency: 'USD' }}</td>
                        <td>{{ product.tipoAlojamiento }}</td>
                        <td><p-rating [ngModel]="product.rating" [readonly]="true" /></td>
                        <td>
                            <p-select [(ngModel)]="product.inventoryStatus" [options]="statuses" optionLabel="label" optionValue="label"
                                (onChange)="onStatusChange(product)" styleClass="w-full border-none shadow-none bg-transparent" appendTo="body">
                                <ng-template #selectedItem let-selectedOption>
                                    <p-tag [value]="selectedOption.label.toUpperCase()" [severity]="getSeverity(selectedOption.label)" />
                                </ng-template>
                            </p-select>
                        </td>
                        <td>
                            <div class="flex gap-2">
                                <p-button icon="pi pi-pencil" [rounded]="true" [outlined]="true" (onClick)="editProduct(product)" />
                                <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (onClick)="deleteProduct(product)" />
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <p-dialog header="Vincular a Calculadora" [(visible)]="destinosDialog" [modal]="true" [style]="{width: '350px'}">
                <div class="flex flex-col gap-4">
                    <p class="text-sm">¿A qué destino quieres sumar este alojamiento como gasto de <b>Hospedaje</b>?</p>
                    <p-select [options]="listaDestinos" [(ngModel)]="destinoSeleccionado" optionLabel="nombre" placeholder="Selecciona destino" styleClass="w-full" appendTo="body"></p-select>
                    <p-button label="Confirmar Gasto" icon="pi pi-check" (onClick)="confirmarVinculacion()" [disabled]="!destinoSeleccionado"></p-button>
                </div>
            </p-dialog>

            <p-dialog [(visible)]="productDialog" [style]="{ width: '550px' }" header="Detalles del Alojamiento" [modal]="true" styleClass="p-fluid">
                <ng-template #content>
                    <div class="flex flex-col gap-5 pt-2">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-800">Nombre del Alojamiento</label>
                            <input type="text" pInputText [(ngModel)]="product.name" required autofocus placeholder="Ej: Hotel Hilton" />
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-800">Tipo de Alojamiento</label>
                                <p-select [(ngModel)]="product.tipoAlojamiento" [options]="tipos" placeholder="Seleccionar tipo" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-800">Estado de Gestión</label>
                                <p-select [(ngModel)]="product.inventoryStatus" [options]="statuses" optionLabel="label" optionValue="label" />
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-800">Precio Sugerido (USD)</label>
                                <p-inputnumber [(ngModel)]="product.price" mode="currency" currency="USD" locale="en-US" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-800">Puntuación Personal</label>
                                <div class="pt-2"><p-rating [(ngModel)]="product.rating" /></div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-800">Enlace Web</label>
                            <div class="p-inputgroup">
                                <span class="p-inputgroup-addon"><i class="pi pi-link"></i></span>
                                <input type="text" pInputText [(ngModel)]="product.URL" placeholder="https://..." />
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-800">Descripción y Notas</label>
                            <textarea pTextarea [(ngModel)]="product.description" rows="5" style="resize: none"></textarea>
                        </div>
                    </div>
                </ng-template>
                <ng-template #footer>
                    <p-button label="Cancelar" [text]="true" severity="secondary" (onClick)="hideDialog()" />
                    <p-button label="Guardar Alojamiento" icon="pi pi-save" severity="success" (onClick)="saveProduct()" />
                </ng-template>
            </p-dialog>
        </div>
    `
})
export class Crud implements OnInit {
    products = signal<Product[]>([]);
    product: Product = {};
    selectedProducts!: Product[] | null;
    submitted: boolean = false;
    productDialog: boolean = false;

    destinosDialog: boolean = false;
    listaDestinos: any[] = [];
    destinoSeleccionado: any = null;
    alojamientoPendiente: Product | null = null;

    statuses = [{ label: 'Visto' }, { label: 'Reservado' }, { label: 'Descartado' }, { label: 'En proceso' }];
    tipos = ['Hotel', 'Casa', 'Apartamento', 'Hostal', 'Otro'];

    private readonly LS_CALC = 'mis_destinos_data_v2';
    private readonly LS_ALOJ = 'mis_alojamientos_data_v1';

    @ViewChild('dt') dt!: Table;

    constructor(private messageService: MessageService, private confirmationService: ConfirmationService) {}

    ngOnInit() { this.loadData(); }

    loadData() {
        const saved = localStorage.getItem(this.LS_ALOJ);
        if (saved) this.products.set(JSON.parse(saved));
    }

    saveToLocal() {
        localStorage.setItem(this.LS_ALOJ, JSON.stringify(this.products()));
    }

    onStatusChange(product: Product) {
        if (product.inventoryStatus === 'Reservado' && !product.registradoEnCalculadora) {
            this.abrirVinculacion(product);
        }
        this.saveToLocal();
    }

    abrirVinculacion(product: Product) {
        const data = localStorage.getItem(this.LS_CALC);
        this.listaDestinos = data ? JSON.parse(data) : [];

        if (this.listaDestinos.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Info', detail: 'Crea un destino en la calculadora primero' });
            return;
        }
        this.alojamientoPendiente = product;
        this.destinosDialog = true;
    }

    confirmarVinculacion() {
        if (!this.alojamientoPendiente || !this.destinoSeleccionado) return;

        const dataCalculadora = JSON.parse(localStorage.getItem(this.LS_CALC) || '[]');
        const index = dataCalculadora.findIndex((d: any) => d.id === this.destinoSeleccionado.id);
        
        if (index !== -1) {
            const nuevoGasto = {
                id: Date.now(),
                refId: this.alojamientoPendiente.id, // REFERENCIA PARA BORRADO EN CADENA
                categoria: 'Hospedaje',
                descripcion: `Reserva: ${this.alojamientoPendiente.name}`,
                monto: this.alojamientoPendiente.price || 0
            };

            if (!dataCalculadora[index].gastos) dataCalculadora[index].gastos = [];
            dataCalculadora[index].gastos.push(nuevoGasto);
            
            localStorage.setItem(this.LS_CALC, JSON.stringify(dataCalculadora));
            window.dispatchEvent(new Event('storage'));

            this.alojamientoPendiente.registradoEnCalculadora = true;
            this.saveToLocal();
            this.messageService.add({ severity: 'success', summary: 'Sincronizado', detail: 'Gasto enviado a la calculadora' });
        }
        this.destinosDialog = false;
    }

    // --- LÓGICA DE BORRADO EN CADENA ---
    private syncDeleteWithCalculadora(idsParaBorrar: (string | undefined)[]) {
        const dataCalc = JSON.parse(localStorage.getItem(this.LS_CALC) || '[]');
        
        const dataActualizada = dataCalc.map((destino: any) => {
            if (destino.gastos) {
                // Filtramos: Solo se quedan los gastos que NO tengan un refId incluido en la lista de IDs borrados
                destino.gastos = destino.gastos.filter((gasto: any) => !idsParaBorrar.includes(gasto.refId));
            }
            return destino;
        });

        localStorage.setItem(this.LS_CALC, JSON.stringify(dataActualizada));
        window.dispatchEvent(new Event('storage')); // Actualizar widgets
    }

    deleteProduct(p: Product) {
        this.confirmationService.confirm({
            message: `¿Eliminar ${p.name}? También se borrará de la calculadora si estaba vinculado.`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                // 1. Borrar de la lista de alojamientos
                this.products.set(this.products().filter((x) => x.id !== p.id));
                this.saveToLocal();
                
                // 2. Borrar de la calculadora
                this.syncDeleteWithCalculadora([p.id]);

                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Alojamiento y gastos eliminados' });
            }
        });
    }

    deleteSelectedProducts() {
        this.confirmationService.confirm({
            message: '¿Eliminar los alojamientos seleccionados? Se borrarán sus gastos vinculados en la calculadora.',
            header: 'Confirmar Masivo',
            icon: 'pi pi-trash',
            accept: () => {
                const idsParaBorrar = this.selectedProducts?.map(p => p.id) || [];
                
                // 1. Borrar de la lista local
                this.products.set(this.products().filter((p) => !this.selectedProducts?.includes(p)));
                this.selectedProducts = null;
                this.saveToLocal();

                // 2. Borrar de la calculadora
                this.syncDeleteWithCalculadora(idsParaBorrar);

                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Seleccionados eliminados con éxito' });
            }
        });
    }

    saveProduct() {
        this.submitted = true;
        if (this.product.name?.trim()) {
            let _products = [...this.products()];
            if (this.product.id) {
                const index = _products.findIndex((p) => p.id === this.product.id);
                _products[index] = this.product;
            } else {
                this.product.id = Math.random().toString(36).substring(2, 9);
                _products.push(this.product);
            }
            this.products.set(_products);
            this.saveToLocal();
            
            if (this.product.inventoryStatus === 'Reservado') this.onStatusChange(this.product);
            
            this.productDialog = false;
            this.product = {};
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Alojamiento guardado' });
        }
    }

    // --- MÉTODOS DE APOYO ---
    calcularTotal() { return this.products().reduce((acc, p) => acc + (p.price || 0), 0); }
    getSeverity(status: string) {
        switch (status) {
            case 'Reservado': return 'success';
            case 'En proceso': return 'warn';
            case 'Descartado': return 'danger';
            case 'Visto': return 'info';
            default: return 'secondary';
        }
    }
    openNew() { this.product = { inventoryStatus: 'Visto', rating: 0 }; this.submitted = false; this.productDialog = true; }
    editProduct(p: Product) { this.product = { ...p }; this.productDialog = true; }
    hideDialog() { this.productDialog = false; this.submitted = false; }
    exportCSV() { this.dt.exportCSV(); }
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}