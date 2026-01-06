import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
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

interface Viaje {
    id?: string;
    origen?: string;
    destino?: string;
    medioTransporte?: string;
    estado?: string;
    costo?: number;
    urlProveedor?: string;
    descripcion?: string;
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
    templateUrl: './gestiondetransporte.html',
    providers: [MessageService, ConfirmationService]
})
export class Gestiondetransporte implements OnInit {
    viajeDialog: boolean = false;
    viajes = signal<Viaje[]>([]);
    viaje: Viaje = {};
    submitted: boolean = false;

    mediosTransporte = [
        { label: 'Aéreo', value: 'Aéreo' },
        { label: 'Marítimo', value: 'Marítimo' },
        { label: 'Terrestre', value: 'Terrestre' }
    ];

    estados = [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Visto', value: 'visto' },
        { label: 'Reservado', value: 'reservado' },
        { label: 'Cancelado', value: 'cancelado' }
    ];

    constructor(private messageService: MessageService, private confirmationService: ConfirmationService) {}

    ngOnInit() {
        this.viajes.set([
            { 
                id: '1', 
                origen: 'Medellín', 
                destino: 'Madrid', 
                medioTransporte: 'Aéreo', 
                estado: 'visto', 
                costo: 850, 
                urlProveedor: 'https://avianca.com', 
                descripcion: 'Vuelo directo con maleta incluida' 
            }
        ]);
    }

  
    calcularTotal() {
        return this.viajes().reduce((acc, v) => acc + (v.costo || 0), 0);
    }

    onStatusChange(viaje: Viaje, nuevoEstado: string) {
        this.messageService.add({ 
            severity: 'info', 
            summary: 'Estado Actualizado', 
            detail: `Viaje a ${viaje.destino} ahora está ${nuevoEstado}` 
        });
    }

    getSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | any {
        switch (status) {
            case 'reservado': return 'success';
            case 'visto': return 'info';
            case 'pendiente': return 'warn';
            case 'cancelado': return 'danger';
            default: return 'secondary';
        }
    }

    openNew() {
        this.viaje = { estado: 'pendiente' };
        this.submitted = false;
        this.viajeDialog = true;
    }

    editViaje(viaje: Viaje) {
        this.viaje = { ...viaje };
        this.viajeDialog = true;
    }

    deleteViaje(viaje: Viaje) {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el viaje a ${viaje.destino}?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.viajes.set(this.viajes().filter((val) => val.id !== viaje.id));
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Viaje Eliminado' });
            }
        });
    }

    saveViaje() {
        this.submitted = true;
        if (this.viaje.origen?.trim() && this.viaje.destino?.trim()) {
            let _viajes = [...this.viajes()];
            if (this.viaje.id) {
                const index = _viajes.findIndex(v => v.id === this.viaje.id);
                _viajes[index] = this.viaje;
            } else {
                this.viaje.id = Math.random().toString(36).substring(2);
                _viajes.push(this.viaje);
            }
            this.viajes.set(_viajes);
            this.viajeDialog = false;
            this.viaje = {};
            this.messageService.add({ severity: 'success', summary: 'Operación Exitosa', detail: 'Los datos se han guardado.' });
        }
    }
}