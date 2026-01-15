import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

export interface IPerfilUsuario {
    nombreUsuario: string;
    correoUsuario: string;
    estadoActivo: boolean;
    fechaCreacion: string;
    ultimoIngreso: string;
    fechaInicioViaje: string;
    presupuestoTotal: number;
    moneda: string;
    destinoPrincipal: string;
}

@Component({
    selector: 'app-perfil-usuario-card',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule],
    providers: [CurrencyPipe],
    templateUrl: './perfil-usuario-card.html',
    styleUrls: ['./perfil-usuario-card.scss']
})
export class PerfilUsuarioCardComponent implements OnInit {
    private router = inject(Router);

    public datosPerfil: IPerfilUsuario | null = null;
    public tieneInformacion: boolean = false;

    // Fechas automáticas fijas
    public readonly FECHA_CREACION = '10/01/2026';
    public readonly ULTIMO_INGRESO = new Date().toLocaleString();

    // Escuchar cambios en LocalStorage (Sincronización automática)
    @HostListener('window:storage')
    onStorageChange() {
        this.cargarInformacionConsolidada();
    }

    ngOnInit() {
        this.cargarInformacionConsolidada();
    }

    cargarInformacionConsolidada() {
        const profileData = localStorage.getItem('user_profile');
        const presupuestoGlobalRaw = localStorage.getItem('mi_presupuesto_global');
        const destinosData = localStorage.getItem('mis_destinos_data_v2');

        // Si no hay perfil, forzamos el estado de "Perfil Incompleto"
        if (!profileData) {
            this.tieneInformacion = false;
            return;
        }

        const profile = JSON.parse(profileData);
        const destinos = destinosData ? JSON.parse(destinosData) : [];
        
        // Lógica de presupuesto: Si no existe o es nulo, ponemos 0
        const presupuestoCalculado = presupuestoGlobalRaw ? JSON.parse(presupuestoGlobalRaw) : 0;

        // Buscar el destino principal (el de mayor inversión)
        let destinoMasCaro = 'Sin destinos';
        if (destinos.length > 0) {
            const topDestino = destinos.reduce((prev: any, current: any) => {
                const suma = (d: any) => (d.gastos || []).reduce((acc: number, g: any) => acc + g.monto, 0);
                return (suma(prev) > suma(current)) ? prev : current;
            });
            destinoMasCaro = topDestino.nombre;
        }

        this.datosPerfil = {
            nombreUsuario: profile.nombre || 'Viajero',
            correoUsuario: profile.email || 'Sin correo',
            estadoActivo: true,
            fechaCreacion: this.FECHA_CREACION,
            ultimoIngreso: this.ULTIMO_INGRESO,
            fechaInicioViaje: profile.fechaViaje ? new Date(profile.fechaViaje).toLocaleDateString() : 'Pendiente',
            presupuestoTotal: presupuestoCalculado, // Aquí se pone 0 automático si no hay datos
            moneda: profile.moneda || 'USD',
            destinoPrincipal: destinoMasCaro
        };

        this.tieneInformacion = true;
    }

    // REDIRECCIÓN A CONFIGURACIÓN (Ruta /presupuesto)
    irAConfiguracion() {
        this.router.navigate(['/presupuesto']);
    }
}