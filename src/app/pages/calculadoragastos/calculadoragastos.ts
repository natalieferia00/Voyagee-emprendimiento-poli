import { Component, OnInit, inject, HostListener, signal, effect, untracked } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG 18
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';

// Servicio
import { BudgetService } from '../service/budget.service';

@Component({
    selector: 'app-calculadora-gastos',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, 
        InputTextModule, InputNumberModule, DialogModule, 
        ToastModule, ConfirmDialogModule, TagModule, TooltipModule, SelectModule
    ],
    providers: [MessageService, ConfirmationService, CurrencyPipe],
    templateUrl: './calculadoragastos.html'
})
export class CalculadoraGastosComponent implements OnInit {
    private budgetService = inject(BudgetService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);

    // Signals para reactividad total
    destinos = signal<any[]>([]);
    presupuestoGlobal = signal<number>(0);
    totalGastado = signal<number>(0);

    // Control de Diálogos
    displayDestino = false;
    displayGasto = false;
    displayDetalle = false;
    
    destinoActual: any = null;
    tempDestino = { nombre: '' };
    tempGasto: any = { categoria: 'Vuelos', monto: 0, descripcion: '' };

    categorias = [
        { label: 'Tiquetes', value: 'Vuelos' },
        { label: 'Hospedaje', value: 'Hospedaje' },
        { label: 'Comida', value: 'Comida' },
        { label: 'Transporte', value: 'Transporte' },
        { label: 'Otros', value: 'Otros' }
    ];

    // Llaves de sincronización unificadas
    private readonly LS_KEY_DATA = 'mis_destinos_data_v2';
    private readonly LS_KEY_SYNC = 'app_presupuesto_sync';
    private readonly LS_KEY_BUDGET = 'backup_budget'; // Llave que leen los widgets del Dashboard

    constructor() {
        // Efecto para sincronizar con los widgets del Dashboard en tiempo real
        effect(() => {
            const lista = this.destinos();
            const presupuesto = this.presupuestoGlobal();
            
            // Persistencia local para seguridad
            localStorage.setItem(this.LS_KEY_DATA, JSON.stringify(lista));
            localStorage.setItem(this.LS_KEY_BUDGET, presupuesto.toString());
            
            untracked(() => {
                this.recalcularTotales();
            });

            // Dispara el evento storage para que el Dashboard actualice sus widgets inmediatamente
            window.dispatchEvent(new Event('storage'));
        });
    }

    @HostListener('window:storage')
    onExternalUpdate() { 
        const data = localStorage.getItem(this.LS_KEY_DATA);
        if (data) {
            const parsed = JSON.parse(data);
            if (JSON.stringify(parsed) !== JSON.stringify(this.destinos())) {
                this.destinos.set(parsed);
            }
        }
    }

    ngOnInit() { 
        this.loadData(); 
    }

    loadData() {
        this.budgetService.getData().subscribe({
            next: (res: any) => {
                this.destinos.set(res.destinos || []);
                this.presupuestoGlobal.set(res.globalBudget || 0);
                // Asegurar que el budget esté en localStorage al cargar
                localStorage.setItem(this.LS_KEY_BUDGET, (res.globalBudget || 0).toString());
            },
            error: () => {
                const localData = localStorage.getItem(this.LS_KEY_DATA);
                const localBudget = localStorage.getItem(this.LS_KEY_BUDGET);
                if (localData) this.destinos.set(JSON.parse(localData));
                if (localBudget) this.presupuestoGlobal.set(Number(localBudget));
            }
        });
    }

    saveGlobalBudget() {
        const monto = Number(this.presupuestoGlobal());
        this.budgetService.saveGlobalBudget(monto).subscribe({
            next: () => {
                // Actualización explícita para asegurar sincronización
                localStorage.setItem(this.LS_KEY_BUDGET, monto.toString());
                window.dispatchEvent(new Event('storage'));
                this.messageService.add({ severity: 'success', summary: 'Presupuesto Sincronizado con Éxito' });
            }
        });
    }

    abrirGasto(d: any) { 
        this.destinoActual = d; 
        this.tempGasto = { categoria: 'Vuelos', monto: 0, descripcion: '' };
        this.displayGasto = true; 
    }

    guardarGasto() {
        if (this.tempGasto.monto <= 0 || !this.destinoActual) return;
        const destinoEditado = { ...this.destinoActual };
        destinoEditado.gastos = [...(this.destinoActual.gastos || []), { ...this.tempGasto }];

        this.budgetService.saveDestino(destinoEditado).subscribe({
            next: () => {
                this.destinos.update(prev => prev.map(d => d._id === destinoEditado._id ? destinoEditado : d));
                this.displayGasto = false;
                this.messageService.add({ severity: 'success', summary: 'Gasto registrado correctamente' });
                window.dispatchEvent(new Event('storage'));
            }
        });
    }

    guardarDestino() {
        if (!this.tempDestino.nombre.trim()) return;
        this.budgetService.saveDestino({ nombre: this.tempDestino.nombre, gastos: [] }).subscribe({
            next: (res) => {
                this.destinos.update(prev => [...prev, res]);
                this.displayDestino = false;
                this.tempDestino.nombre = '';
                window.dispatchEvent(new Event('storage'));
            }
        });
    }

    eliminarDestino(d: any) {
        this.confirmationService.confirm({
            message: `¿Eliminar permanentemente el destino ${d.nombre}?`,
            accept: () => {
                this.budgetService.deleteDestino(d._id).subscribe({
                    next: () => {
                        this.destinos.update(prev => prev.filter(item => item._id !== d._id));
                        window.dispatchEvent(new Event('storage'));
                    }
                });
            }
        });
    }

    recalcularTotales() {
        const totalManual = this.destinos().reduce((acc, d) => acc + this.sumarGastos(d), 0);
        
        const docs = JSON.parse(localStorage.getItem('docs_viaje') || '[]');
        const totalSeguros = docs.filter((d: any) => d.reservadoComprado).reduce((acc: number, curr: any) => acc + (Number(curr.costo) || 0), 0);
        
        const actividades = JSON.parse(localStorage.getItem('actividades_viaje') || '[]');
        const totalActividades = actividades.filter((a: any) => a.estado === 'Reservado').reduce((acc: number, curr: any) => acc + (Number(curr.precio) || 0), 0);

        this.totalGastado.set(totalManual + totalSeguros + totalActividades);
        this.generarDataWidgets(totalSeguros, totalActividades);
    }

    generarDataWidgets(seguros: number, actividades: number) {
        const suma = (cat: string) => this.destinos().reduce((acc, d) => 
            acc + (d.gastos || []).filter((g: any) => g.categoria === cat).reduce((s: number, g: any) => s + (g.monto || 0), 0), 0);

        const presupuesto = this.presupuestoGlobal() || 1;
        
        const dataWidget = [
            { nombre: 'Tiquetes', color: 'bg-orange-500', gastado: suma('Vuelos'), total: presupuesto * 0.4 },
            { nombre: 'Hospedaje', color: 'bg-purple-500', gastado: suma('Hospedaje'), total: presupuesto * 0.3 },
            { nombre: 'Actividades', color: 'bg-yellow-500', gastado: actividades, total: presupuesto * 0.15 },
            { nombre: 'Comida', color: 'bg-emerald-500', gastado: suma('Comida'), total: presupuesto * 0.1 },
            { nombre: 'Documentos', color: 'bg-blue-500', gastado: seguros, total: presupuesto * 0.05 }
        ];
        localStorage.setItem(this.LS_KEY_SYNC, JSON.stringify(dataWidget));
    }

    sumarGastos(d: any) { 
        return (d?.gastos || []).reduce((acc: number, g: any) => acc + (Number(g.monto) || 0), 0); 
    }

    verDetalleDestino(d: any) {
        this.destinoActual = d;
        this.displayDetalle = true;
    }
}