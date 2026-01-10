import { Component, OnInit, signal, HostListener, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';

type SeverityType = "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined;

interface Viaje {
    id?: string;
    origen?: string;
    destino?: string;
    medioTransporte?: string;
    estado?: string;
    costo?: number;
    urlProveedor?: string;
    descripcion?: string;
    registradoEnCalculadora?: boolean;
    refGastoId?: number;
}

@Component({
    selector: 'app-gestion-transporte',
    standalone: true,
    imports: [
        CommonModule, TableModule, FormsModule, ButtonModule, ToastModule,
        ToolbarModule, InputTextModule, TextareaModule, SelectModule,
        DialogModule, TagModule, InputIconModule, IconFieldModule, 
        ConfirmDialogModule, InputNumberModule, TooltipModule
    ],
    providers: [MessageService, ConfirmationService, CurrencyPipe],
    templateUrl: './gestiondetransporte.html'
})
export class Gestiondetransporte implements OnInit {
    viajeDialog: boolean = false;
    viajes = signal<Viaje[]>([]);
    viaje: Viaje = {};
    submitted: boolean = false;

    destinosDialog: boolean = false;
    listaDestinos: any[] = [];
    destinoSeleccionado: any = null;
    viajePendiente: Viaje | null = null;

    private readonly LS_CALC = 'mis_destinos_data_v2';
    private readonly LS_TRANS = 'mis_transporte_data_v1';

    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    @HostListener('window:storage')
    onExternalUpdate() { this.loadViajes(); }

    mediosTransporte = [
        { label: '✈️ Aéreo', value: 'Aéreo' },
        { label: '🚢 Marítimo', value: 'Marítimo' },
        { label: '🚌 Terrestre', value: 'Terrestre' },
        { label: '🚗 Alquiler / Taxi', value: 'Alquiler' }
    ];

    estados = [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Visto', value: 'visto' },
        { label: 'Reservado', value: 'reservado' },
        { label: 'Cancelado', value: 'cancelado' }
    ];

    ngOnInit() { this.loadViajes(); }

    loadViajes() {
        const saved = localStorage.getItem(this.LS_TRANS);
        if (saved) this.viajes.set(JSON.parse(saved));
    }

    getSeverity(status: string | undefined): SeverityType {
        switch (status) {
            case 'reservado': return 'success';
            case 'visto': return 'info';
            case 'pendiente': return 'warn';
            case 'cancelado': return 'danger';
            default: return 'secondary';
        }
    }

    onStatusChange(viaje: Viaje) {
        if (viaje.estado === 'reservado' && !viaje.registradoEnCalculadora) {
            this.abrirVinculacion(viaje);
        } else if (viaje.estado !== 'reservado' && viaje.registradoEnCalculadora) {
            this.eliminarGastoDeCalculadora(viaje);
        }
        this.saveToLocal();
    }

    abrirVinculacion(viaje: Viaje) {
        const data = localStorage.getItem(this.LS_CALC);
        this.listaDestinos = data ? JSON.parse(data) : [];
        if (this.listaDestinos.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Info', detail: 'Crea un destino en la calculadora primero' });
            viaje.estado = 'pendiente';
            return;
        }
        this.viajePendiente = viaje;
        this.destinosDialog = true;
    }

    confirmarVinculacion() {
        if (!this.viajePendiente || !this.destinoSeleccionado) return;
        const dataCalculadora = JSON.parse(localStorage.getItem(this.LS_CALC) || '[]');
        const index = dataCalculadora.findIndex((d: any) => d.id === this.destinoSeleccionado.id);
        
        if (index !== -1) {
            const gastoId = Date.now();
            if (!dataCalculadora[index].gastos) dataCalculadora[index].gastos = [];
            
            dataCalculadora[index].gastos.push({
                id: gastoId,
                refId: this.viajePendiente.id,
                categoria: 'Transporte',
                descripcion: `Transp: ${this.viajePendiente.medioTransporte} (${this.viajePendiente.origen} ➔ ${this.viajePendiente.destino})`,
                monto: this.viajePendiente.costo || 0
            });

            localStorage.setItem(this.LS_CALC, JSON.stringify(dataCalculadora));
            window.dispatchEvent(new Event('storage'));
            
            this.viajePendiente.registradoEnCalculadora = true;
            this.viajePendiente.refGastoId = gastoId;
            this.saveToLocal();
            this.messageService.add({ severity: 'success', summary: 'Sincronizado', detail: 'Costo añadido al presupuesto' });
        }
        this.destinosDialog = false;
    }

    eliminarGastoDeCalculadora(viaje: Viaje) {
        const dataCalc = JSON.parse(localStorage.getItem(this.LS_CALC) || '[]');
        let huboCambio = false;
        dataCalc.forEach((destino: any) => {
            if (destino.gastos) {
                const originalLen = destino.gastos.length;
                destino.gastos = destino.gastos.filter((g: any) => g.refId !== viaje.id && g.id !== viaje.refGastoId);
                if (destino.gastos.length !== originalLen) huboCambio = true;
            }
        });
        if (huboCambio) {
            localStorage.setItem(this.LS_CALC, JSON.stringify(dataCalc));
            window.dispatchEvent(new Event('storage'));
        }
        viaje.registradoEnCalculadora = false;
        viaje.refGastoId = undefined;
    }

    saveViaje() {
        this.submitted = true;
        if (!this.viaje.origen?.trim() || !this.viaje.destino?.trim()) return;

        let _viajes = [...this.viajes()];
        if (this.viaje.id) {
            const index = _viajes.findIndex(v => v.id === this.viaje.id);
            _viajes[index] = this.viaje;
        } else {
            this.viaje.id = Date.now().toString();
            _viajes.push(this.viaje);
        }

        this.viajes.set(_viajes);
        this.saveToLocal();

        if (this.viaje.estado === 'reservado') {
            this.onStatusChange(this.viaje);
        } else if (this.viaje.registradoEnCalculadora) {
            this.eliminarGastoDeCalculadora(this.viaje);
        }

        this.viajeDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Información guardada' });
    }

    deleteViaje(viaje: Viaje) {
        this.confirmationService.confirm({
            message: `¿Eliminar transporte a ${viaje.destino}?`,
            header: 'Confirmar acción',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.eliminarGastoDeCalculadora(viaje);
                this.viajes.set(this.viajes().filter((val) => val.id !== viaje.id));
                this.saveToLocal();
                this.messageService.add({ severity: 'info', summary: 'Borrado', detail: 'Registro eliminado' });
            }
        });
    }

    saveToLocal() { localStorage.setItem(this.LS_TRANS, JSON.stringify(this.viajes())); }
    calcularTotal() { return this.viajes().reduce((acc, v) => acc + (v.costo || 0), 0); }
    openNew() { this.viaje = { estado: 'pendiente' }; this.submitted = false; this.viajeDialog = true; }
    editViaje(viaje: Viaje) { this.viaje = { ...viaje }; this.viajeDialog = true; }
    hideDialog() { this.viajeDialog = false; }
}