import { Component, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';


@Component({
    selector: 'app-documentation',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, 
        DialogModule, InputTextModule, InputNumberModule, 
        CheckboxModule, TooltipModule, 
    ],
    templateUrl: './seguros.html'
})
export class DocumentationComponent implements OnInit {
    displayModal: boolean = false;
    
    // Lista de documentos usando Signals
    documentos = signal<any[]>(JSON.parse(localStorage.getItem('docs_viaje') || '[]'));
    
    // Calculo automático del total para el cuadro negro
    totalAcumulado = computed(() => {
        return this.documentos()
            .filter(d => d.reservadoComprado)
            .reduce((acc, curr) => acc + (curr.costo || 0), 0);
    });

    nuevoDoc: any = this.resetForm();

    constructor() {
        // Cada vez que documentos cambie, sincronizamos con LocalStorage y la Calculadora
        effect(() => {
            const lista = this.documentos();
            localStorage.setItem('docs_viaje', JSON.stringify(lista));
            
            // Disparar evento para que otros componentes (como la calculadora) se actualicen
            window.dispatchEvent(new Event('storage'));
        });
    }

    ngOnInit(): void {}

    toggleEstado(): void {
        this.documentos.update(l => [...l]);
    }

    resetForm() {
        return { 
            nombre: '', 
            entidad: '', 
            url: '', 
            descripcion: '', 
            costo: 0, 
            reservadoComprado: false 
        };
    }

    abrirModal(): void {
        this.nuevoDoc = this.resetForm();
        this.displayModal = true;
    }

    guardar(): void {
        if (this.nuevoDoc.nombre) {
            this.documentos.update(l => [...l, { ...this.nuevoDoc, id: Date.now() }]);
            this.displayModal = false;
        }
    }

    eliminar(id: number): void {
        this.documentos.update(l => l.filter(d => d.id !== id));
    }

    formatCurrency(v: number): string {
        return v.toLocaleString('es-CO', { 
            style: 'currency', 
            currency: 'COP', 
            minimumFractionDigits: 0 
        });
    }
}