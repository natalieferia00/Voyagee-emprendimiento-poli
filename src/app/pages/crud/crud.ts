import { Component, OnInit, signal, ViewChild, inject } from '@angular/core';
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

// Importante: Ajusta esta ruta a tu servicio real
import { HotelService } from '../service/hotel.service';

export interface Product {
    id?: string;
    _id?: string;
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
    selector: 'app-alojamientos',
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
                <div class="font-semibold text-xl text-800">Gestión de Alojamientos (MongoDB)</div>
                <p-tag severity="contrast" [style]="{'font-size': '1.1rem', 'padding': '8px 15px'}" 
                        [value]="'Inversión Total: ' + (calcularTotal() | currency:'USD':'symbol':'1.0-2')" />
            </div>

            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <p-button label="Nuevo Alojamiento" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
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
                        <th class="text-center">Notas</th> 
                        <th>Precio (USD)</th>
                        <th>Tipo</th>
                        <th>Rating</th>
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
                            <i *ngIf="product.description" class="pi pi-comment text-primary cursor-pointer text-xl" [pTooltip]="product.description" tooltipPosition="top"></i>
                            <i *ngIf="!product.description" class="pi pi-comment text-200"></i>
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
                    <p-button label="Confirmar Gasto" icon="pi pi-check" (onClick)="confirmarVinculacion()" [disabled]="!destinoSeleccionado" severity="success" class="w-full"></p-button>
                </div>
            </p-dialog>

            <p-dialog [(visible)]="productDialog" [style]="{ width: '550px' }" header="Detalles del Alojamiento" [modal]="true" styleClass="p-fluid">
                <ng-template #content>
                    <div class="flex flex-col gap-5 pt-2">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-800">Nombre del Alojamiento</label>
                            <input type="text" pInputText [(ngModel)]="product.name" required autofocus placeholder="Ej: Airbnb Roma" />
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-800">Tipo</label>
                                <p-select [(ngModel)]="product.tipoAlojamiento" [options]="tipos" placeholder="Seleccionar" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-800">Estado</label>
                                <p-select [(ngModel)]="product.inventoryStatus" [options]="statuses" optionLabel="label" optionValue="label" />
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-800">Precio (USD)</label>
                                <p-inputnumber [(ngModel)]="product.price" mode="currency" currency="USD" locale="en-US" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-800">Rating</label>
                                <div class="pt-2"><p-rating [(ngModel)]="product.rating" /></div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-800">Link Web</label>
                            <input type="text" pInputText [(ngModel)]="product.URL" placeholder="https://..." />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-800">Notas</label>
                            <textarea pTextarea [(ngModel)]="product.description" rows="3" style="resize: none"></textarea>
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
    private hotelService = inject(HotelService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

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

    @ViewChild('dt') dt!: Table;

    ngOnInit() { this.loadData(); }

    loadData() {
        this.hotelService.getHotels().subscribe({
            next: (data: any) => {
                const mapped = data.map((h: any) => ({
                    id: h._id,
                    name: h.nombre,
                    description: h.notas,
                    price: h.precioTotal,
                    inventoryStatus: h.status,
                    tipoAlojamiento: h.tipo,
                    URL: h.url,
                    rating: h.rating || 0,
                    registradoEnCalculadora: h.registradoEnCalculadora
                }));
                this.products.set(mapped);
            }
        });
    }

    saveProduct() {
        this.submitted = true;
        if (this.product.name?.trim()) {
            const body = {
                _id: this.product.id,
                nombre: this.product.name,
                notas: this.product.description,
                precioTotal: this.product.price,
                status: this.product.inventoryStatus,
                tipo: this.product.tipoAlojamiento,
                url: this.product.URL,
                rating: this.product.rating,
                registradoEnCalculadora: this.product.registradoEnCalculadora
            };

            this.hotelService.saveHotel(body).subscribe({
                next: (res: any) => {
                    this.loadData();
                    if (this.product.inventoryStatus === 'Reservado' && !this.product.registradoEnCalculadora) {
                        this.abrirVinculacion({ ...this.product, id: res._id });
                    }
                    this.productDialog = false;
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sincronizado con MongoDB' });
                }
            });
        }
    }

    onStatusChange(product: Product) {
        if (product.inventoryStatus === 'Reservado') {
            if (!product.registradoEnCalculadora) this.abrirVinculacion(product);
        } else if (product.registradoEnCalculadora) {
            this.syncDeleteWithCalculadora([product.id]);
            product.registradoEnCalculadora = false;
            this.updateQuickStatus(product);
        }
    }

    updateQuickStatus(product: Product) {
        this.hotelService.saveHotel({ _id: product.id, status: product.inventoryStatus, registradoEnCalculadora: product.registradoEnCalculadora }).subscribe();
    }

    abrirVinculacion(product: Product) {
        const data = localStorage.getItem(this.LS_CALC);
        this.listaDestinos = data ? JSON.parse(data) : [];
        if (this.listaDestinos.length === 0) {
            this.messageService.add({ severity: 'warn', detail: 'Crea un destino en la calculadora primero' });
            return;
        }
        this.alojamientoPendiente = product;
        this.destinosDialog = true;
    }

    confirmarVinculacion() {
        if (!this.alojamientoPendiente || !this.destinoSeleccionado) return;
        const dataCalc = JSON.parse(localStorage.getItem(this.LS_CALC) || '[]');
        const idx = dataCalc.findIndex((d: any) => d.id === this.destinoSeleccionado.id);
        
        if (idx !== -1) {
            const gasto = { id: Date.now(), refId: this.alojamientoPendiente.id, categoria: 'Hospedaje', descripcion: `Hotel: ${this.alojamientoPendiente.name}`, monto: this.alojamientoPendiente.price || 0 };
            if (!dataCalc[idx].gastos) dataCalc[idx].gastos = [];
            dataCalc[idx].gastos.push(gasto);
            localStorage.setItem(this.LS_CALC, JSON.stringify(dataCalc));
            window.dispatchEvent(new Event('storage'));
            this.alojamientoPendiente.registradoEnCalculadora = true;
            this.updateQuickStatus(this.alojamientoPendiente);
            this.messageService.add({ severity: 'success', summary: 'Calculadora Actualizada' });
        }
        this.destinosDialog = false;
    }

    deleteProduct(p: Product) {
        this.confirmationService.confirm({
            message: `¿Eliminar ${p.name}?`,
            accept: () => {
                this.hotelService.deleteHotel(p.id!).subscribe(() => {
                    this.products.set(this.products().filter(x => x.id !== p.id));
                    this.syncDeleteWithCalculadora([p.id]);
                });
            }
        });
    }

    private syncDeleteWithCalculadora(ids: (string | undefined)[]) {
        const data = JSON.parse(localStorage.getItem(this.LS_CALC) || '[]');
        const updated = data.map((d: any) => {
            if (d.gastos) d.gastos = d.gastos.filter((g: any) => !ids.includes(g.refId));
            return d;
        });
        localStorage.setItem(this.LS_CALC, JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
    }

    calcularTotal() { return this.products().reduce((acc, p) => acc + (p.price || 0), 0); }
    getSeverity(s: string) {
        if (s === 'Reservado') return 'success';
        if (s === 'En proceso') return 'warn';
        if (s === 'Descartado') return 'danger';
        return 'info';
    }
    openNew() { this.product = { inventoryStatus: 'Visto', rating: 0 }; this.productDialog = true; }
    editProduct(p: Product) { this.product = { ...p }; this.productDialog = true; }
    hideDialog() { this.productDialog = false; }
    exportCSV() { this.dt.exportCSV(); }
    onGlobalFilter(t: Table, e: Event) { t.filterGlobal((e.target as HTMLInputElement).value, 'contains'); }
}