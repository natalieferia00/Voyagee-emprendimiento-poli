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
import { Product, ProductService } from '../service/product.service';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

@Component({
    selector: 'app-crud',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        RatingModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule
    ],
    template: `
       <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button severity="secondary" label="Delete" icon="pi pi-trash" outlined (onClick)="deleteSelectedProducts()" [disabled]="!selectedProducts || !selectedProducts.length" />
            </ng-template>

            <ng-template #end>
                <p-button label="Export" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="products()"
            [rows]="10"
            [columns]="cols"
            [paginator]="true"
            [globalFilterFields]="['name', 'URL', 'tipoAlojamiento', 'inventoryStatus']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedProducts"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Alojamientos</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
                    </p-iconfield>
                </div>
            </ng-template>

            <ng-template #header>
                <tr>
                    <th style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th>Codigo</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th>URL</th>
                    <th>Tipo Alojamiento</th>
                    <th>Estrellas</th>
                    <th>Estado</th>
                    <th></th>
                </tr>
            </ng-template>

            <ng-template #body let-product>
                <tr>
                    <td style="width: 3rem">
                        <p-tableCheckbox [value]="product" />
                    </td>

                    <td>{{ product.code }}</td>
                    <td>{{ product.name }}</td>

                    <td>
                        <p-button label="Ver" size="small" (onClick)="verDescripcion(product)" />
                    </td>

                    <td>{{ product.price | currency: 'USD' }}</td>

                    <td>
                        <a [href]="product.URL" target="_blank" class="text-primary hover:underline">
                            {{ product.URL }}
                        </a>
                    </td>

                    <td>{{ product.tipoAlojamiento }}</td>

                    <td>
                        <p-rating [(ngModel)]="product.rating" [readonly]="true" />
                    </td>

                    <td>
                        <p-tag [value]="product.inventoryStatus" [severity]="getSeverity(product.inventoryStatus)" />
                    </td>

                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editProduct(product)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteProduct(product)" />
                    </td>
                </tr>
            </ng-template>

            <ng-template #emptymessage>
                <tr>
                    <td colspan="10">No se encontraron alojamientos.</td>
                </tr>
            </ng-template>
        </p-table>

        <!-- DIALOGO ALOJAMIENTO -->
        <p-dialog [(visible)]="productDialog" [style]="{ width: '450px' }" header="Detalles del alojamiento" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">

                    <div>
                        <label class="block font-bold mb-2">Nombre</label>
                        <input type="text" pInputText [(ngModel)]="product.name" required autofocus fluid />
                    </div>

                    <div>
                        <label class="block font-bold mb-2">Descripción</label>
                        <textarea pTextarea [(ngModel)]="product.description" rows="3" fluid></textarea>
                    </div>

                    <div>
                        <label class="block font-bold mb-2">Estado</label>
                        <p-select [(ngModel)]="product.inventoryStatus" [options]="statuses" optionLabel="label" optionValue="label" placeholder="Seleccionar" fluid />
                    </div>

                    <div>
                        <label class="block font-bold mb-2">Tipo alojamiento</label>
                        <p-select [(ngModel)]="product.tipoAlojamiento" [options]="[
                                {label:'Hotel', value:'Hotel'},
                                {label:'Resort', value:'Resort'},
                                {label:'Casa', value:'Casa'}
                        ]" placeholder="Elegir..." fluid></p-select>
                    </div>

                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-6">
                            <label class="block font-bold mb-2">Precio</label>
                            <p-inputnumber [(ngModel)]="product.price" mode="currency" currency="USD" locale="en-US" fluid />
                        </div>

                        <div class="col-span-6">
                            <label class="block font-bold mb-2">Estrellas</label>
                            <p-inputnumber [(ngModel)]="product.rating" [max]="5" fluid />
                        </div>
                    </div>

                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (click)="saveProduct()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog />
    `,
    providers: [MessageService, ProductService, ConfirmationService]
})
export class Crud implements OnInit {
    
    productDialog: boolean = false;
    products = signal<Product[]>([]);
    product!: Product;
    selectedProducts!: Product[] | null;
    submitted: boolean = false;

    statuses = [
        { label: 'Visto' },
        { label: 'Reservado' },
        { label: 'Descartado' },
        { label: 'En proceso' }
    ];

    cols!: Column[];
    exportColumns!: ExportColumn[];

    @ViewChild('dt') dt!: Table;

    constructor(
        private productService: ProductService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadDemoData();
    }

    loadDemoData() {
        this.productService.getProducts().then((data) => {
            this.products.set(data);
        });

        this.cols = [
            { field: 'code', header: 'Código' },
            { field: 'name', header: 'Nombre' },
            { field: 'description', header: 'Descripción' },
            { field: 'URL', header: 'URL' }
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    verDescripcion(item: Product) {
        alert('Descripción:\n\n' + item.description);
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.product = {};
        this.productDialog = true;
    }

    editProduct(product: Product) {
        this.product = { ...product };
        this.productDialog = true;
    }

    hideDialog() {
        this.productDialog = false;
        this.submitted = false;
    }

    deleteSelectedProducts() {
        this.confirmationService.confirm({
            message: '¿Deseas eliminar estos alojamientos?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.products.set(this.products().filter((p) => !this.selectedProducts?.includes(p)));
                this.selectedProducts = null;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Eliminados',
                    detail: 'Alojamientos eliminados'
                });
            }
        });
    }

    deleteProduct(product: Product) {
        this.confirmationService.confirm({
            message: '¿Eliminar ' + product.name + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.products.set(this.products().filter((p) => p.id !== product.id));
                this.messageService.add({
                    severity: 'success',
                    summary: 'Eliminado',
                    detail: 'Alojamiento eliminado'
                });
            }
        });
    }

    saveProduct() {
        this.submitted = true;

        let _products = [...this.products()];

        if (this.product.name?.trim()) {
            if (this.product.id) {
                const index = _products.findIndex((p) => p.id === this.product.id);
                _products[index] = this.product;
            } else {
                this.product.id = Math.random().toString(36).substring(2);
                _products.push(this.product);
            }

            this.products.set(_products);
            this.productDialog = false;
            this.product = {};

            this.messageService.add({
                severity: 'success',
                summary: 'Guardado',
                detail: 'Alojamiento actualizado/creado'
            });
        }
    }

    getSeverity(status: string) {
        switch (status) {
            case 'Reservado':
                return 'success';
            case 'En proceso':
                return 'warn';
            case 'Descartado':
                return 'danger';
            default:
                return 'info';
        }
    }
}
