import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
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
import { Product as BaseProduct, ProductService } from '../service/product.service';

export interface Product extends BaseProduct {
    URL?: string;
    tipoAlojamiento?: string;
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
    providers: [MessageService, ProductService, ConfirmationService],
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

            <p-table
                #dt
                [value]="products()"
                [rows]="10"
                [paginator]="true"
                [globalFilterFields]="['name', 'tipoAlojamiento', 'inventoryStatus']"
                [tableStyle]="{ 'min-width': '75rem' }"
                [(selection)]="selectedProducts"
                [rowHover]="true"
                dataKey="id"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
                [showCurrentPageReport]="true"
                [rowsPerPageOptions]="[10, 20, 30]"
            >
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
                            <i *ngIf="product.description" 
                               class="pi pi-eye text-primary cursor-pointer text-xl" 
                               [pTooltip]="product.description" 
                               tooltipPosition="top">
                            </i>
                            <i *ngIf="!product.description" class="pi pi-eye-slash text-300"></i>
                        </td>

                        <td class="font-medium text-primary">{{ product.price | currency: 'USD' }}</td>
                        <td>{{ product.tipoAlojamiento }}</td>
                        <td><p-rating [ngModel]="product.rating" [readonly]="true" /></td>
                        
                        <td>
                            <p-select 
                                 [(ngModel)]="product.inventoryStatus" 
                                 [options]="statuses" 
                                 optionLabel="label" 
                                 optionValue="label"
                                 (onChange)="onStatusChange(product, $event.value)"
                                 styleClass="w-full border-none shadow-none bg-transparent"
                                 appendTo="body">
                                 <ng-template #selectedItem let-selectedOption>
                                     <p-tag [value]="selectedOption.label.toUpperCase()" [severity]="getSeverity(selectedOption.label)" />
                                 </ng-template>
                                 <ng-template let-option #item>
                                     <p-tag [value]="option.label.toUpperCase()" [severity]="getSeverity(option.label)" />
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

            <p-dialog [(visible)]="productDialog" [style]="{ width: '550px' }" header="Detalles del Alojamiento" [modal]="true" styleClass="p-fluid">
                <ng-template #content>
                    <div class="flex flex-col gap-5 pt-2">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-800">Nombre del Alojamiento</label>
                            <input type="text" pInputText [(ngModel)]="product.name" required autofocus placeholder="Ej: Hotel Hilton" />
                            <small class="text-red-500" *ngIf="submitted && !product.name">El nombre es requerido.</small>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-800">Tipo de Alojamiento</label>
                                <p-select [(ngModel)]="product.tipoAlojamiento" [options]="tipos" placeholder="Seleccionar tipo" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-800">Estado de Gestión</label>
                                <p-select [(ngModel)]="product.inventoryStatus" [options]="statuses" optionLabel="label" optionValue="label" placeholder="Estado" />
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-800">Precio Sugerido (USD)</label>
                                <p-inputnumber [(ngModel)]="product.price" mode="currency" currency="USD" locale="en-US" placeholder="$0.00" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-800">Puntuación Personal</label>
                                <div class="pt-2">
                                    <p-rating [(ngModel)]="product.rating" />
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-800">Enlace Web (Booking, Airbnb, Web)</label>
                            <div class="p-inputgroup">
                                <span class="p-inputgroup-addon"><i class="pi pi-link"></i></span>
                                <input type="text" pInputText [(ngModel)]="product.URL" placeholder="https://www.ejemplo.com" />
                            </div>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-800">Descripción, Logística y Notas</label>
                            <textarea pTextarea [(ngModel)]="product.description" rows="5" style="resize: none" placeholder="Dirección exacta, horarios de check-in..."></textarea>
                        </div>
                    </div>
                </ng-template>

                <ng-template #footer>
                    <div class="flex justify-end gap-2">
                        <p-button label="Cancelar" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="hideDialog()" />
                        <p-button label="Guardar Alojamiento" icon="pi pi-save" severity="success" [raised]="true" (onClick)="saveProduct()" />
                    </div>
                </ng-template>
            </p-dialog>
        </div>
    `
})
export class Crud implements OnInit {
    productDialog: boolean = false;
    products = signal<Product[]>([]);
    product: Product = {};
    selectedProducts!: Product[] | null;
    submitted: boolean = false;

    statuses = [
        { label: 'Visto' },
        { label: 'Reservado' },
        { label: 'Descartado' },
        { label: 'En proceso' }
    ];

    tipos = ['Hotel', 'Casa', 'Apartamento', 'Hostal', 'Otro'];

    @ViewChild('dt') dt!: Table;

    constructor(
        private productService: ProductService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadData();
    }

    // NUEVA FUNCIÓN DE CÁLCULO
    calcularTotal() {
        return this.products().reduce((acc, p) => acc + (p.price || 0), 0);
    }

    loadData() {
        this.productService.getProducts().then((data) => {
            this.products.set(data);
        });
    }

    onStatusChange(product: Product, nuevoEstado: string) {
        this.messageService.add({ 
            severity: 'info', 
            summary: 'Estado Actualizado', 
            detail: `${product.name}: ${nuevoEstado}` 
        });
    }

    getSeverity(status: string) {
        switch (status) {
            case 'Reservado': return 'success';
            case 'En proceso': return 'warn';
            case 'Descartado': return 'danger';
            case 'Visto': return 'info';
            default: return 'secondary';
        }
    }

    openNew() {
        this.product = { inventoryStatus: 'Visto', rating: 0 };
        this.submitted = false;
        this.productDialog = true;
    }

    editProduct(product: Product) {
        this.product = { ...product };
        this.productDialog = true;
    }

    saveProduct() {
        this.submitted = true;
        if (this.product.name?.trim()) {
            let _products = [...this.products()];

            if (this.product.id) {
                const index = _products.findIndex((p) => p.id === this.product.id);
                _products[index] = this.product;
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado correctamente' });
            } else {
                this.product.id = Math.random().toString(36).substring(2, 9);
                _products.push(this.product);
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Creado correctamente' });
            }

            this.products.set(_products);
            this.productDialog = false;
            this.product = {};
        }
    }

    deleteProduct(product: Product) {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar ${product.name}?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.products.set(this.products().filter((p) => p.id !== product.id));
                this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Alojamiento eliminado' });
            }
        });
    }

    deleteSelectedProducts() {
        this.confirmationService.confirm({
            message: '¿Deseas eliminar los seleccionados?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.products.set(this.products().filter((p) => !this.selectedProducts?.includes(p)));
                this.selectedProducts = null;
                this.messageService.add({ severity: 'success', summary: 'Eliminados', detail: 'Registros eliminados' });
            }
        });
    }

    hideDialog() {
        this.productDialog = false;
        this.submitted = false;
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}