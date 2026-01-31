import { Component, OnInit, signal, effect, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentationService } from '../service/documentation.service';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-documentation',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, 
        DialogModule, InputTextModule, InputNumberModule, 
        CheckboxModule, TooltipModule, ToastModule
    ],
    providers: [MessageService],
    templateUrl: './seguros.html'
})
export class DocumentationComponent implements OnInit {
    private docService = inject(DocumentationService);
    private messageService = inject(MessageService);

    displayModal: boolean = false;
    documentos = signal<any[]>([]);
    
    // El cuadro negro de inversión se calcula sobre lo que está comprado/reservado
    totalAcumulado = computed(() => {
        return this.documentos()
            .filter(d => d.reservadoComprado)
            .reduce((acc, curr) => acc + (curr.costo || 0), 0);
    });

    nuevoDoc: any = this.resetForm();

    constructor() {
        // Efecto para sincronizar con la calculadora (LocalStorage) cada vez que cambian los documentos
        effect(() => {
            const lista = this.documentos();
            localStorage.setItem('docs_viaje', JSON.stringify(lista));
            // Notificar a los widgets de la calculadora para que recalculen
            window.dispatchEvent(new Event('storage'));
        });
    }

    ngOnInit(): void {
        this.loadData();
    }

    loadData() {
        this.docService.getDocs().subscribe({
            next: (res) => this.documentos.set(res),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la nube' })
        });
    }

    toggleEstado(doc: any): void {
        // Actualizar en BD cuando cambian el checkbox
        this.docService.saveDoc(doc).subscribe();
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
        if (!this.nuevoDoc.nombre) return;

        this.docService.saveDoc(this.nuevoDoc).subscribe({
            next: () => {
                this.loadData();
                this.displayModal = false;
                this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Documento registrado' });
            }
        });
    }

    eliminar(id: string): void {
        this.docService.deleteDoc(id).subscribe({
            next: () => {
                this.documentos.update(l => l.filter(d => d._id !== id));
                this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Registro borrado' });
            }
        });
    }

    formatCurrency(v: number): string {
        return v.toLocaleString('es-CO', { 
            style: 'currency', 
            currency: 'COP', 
            minimumFractionDigits: 0 
        });
    }
}