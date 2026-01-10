import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ViajeService {
    // Señales para estado reactivo
    documentos = signal<any[]>(JSON.parse(localStorage.getItem('documentos') || '[]'));
    presupuestoOtros = signal<number>(Number(localStorage.getItem('presupuestoOtros')) || 0);

    constructor() {
        // Efectos: Cada vez que una señal cambia, se guarda en LocalStorage automáticamente
        effect(() => {
            localStorage.setItem('documentos', JSON.stringify(this.documentos()));
            this.actualizarGastoOtros();
        });
    }

    private actualizarGastoOtros() {
        const total = this.documentos().reduce((acc, doc) => acc + (doc.costo || 0), 0);
        this.presupuestoOtros.set(total);
        localStorage.setItem('presupuestoOtros', total.toString());
    }

    agregarDocumento(doc: any) {
        this.documentos.update(list => [...list, { ...doc, id: Date.now() }]);
    }

    eliminarDocumento(id: number) {
        this.documentos.update(list => list.filter(d => d.id !== id));
    }
}