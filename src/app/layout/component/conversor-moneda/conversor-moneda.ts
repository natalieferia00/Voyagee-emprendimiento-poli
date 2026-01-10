import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-conversor-moneda',
    standalone: true,
    imports: [CommonModule, FormsModule, InputNumberModule, ButtonModule],
    template: `
        <div class="flex flex-column gap-4 p-3">
            <div class="flex flex-column gap-2">
                <span class="text-900 font-semibold text-xl">Monto a Convertir</span>
                <div class="flex flex-column gap-1">
                    <label class="text-400 text-xs font-bold uppercase tracking-wider">Monto</label>
                    <div class="p-inputgroup custom-input-wrapper">
                        <span class="p-inputgroup-addon bg-transparent border-none text-900 font-bold pr-0">COP</span>
                        <p-inputNumber 
                            [(ngModel)]="montoCOP" 
                            (onInput)="convertir()" 
                            mode="decimal" 
                            [minFractionDigits]="0"
                            placeholder="0"
                            class="w-full">
                        </p-inputNumber>
                    </div>
                </div>
            </div>

            <div class="flex gap-2">
                <button class="circle-btn"><i class="pi pi-info-circle"></i></button>
                <button class="circle-btn"><i class="pi pi-arrow-down"></i></button>
                <button class="circle-btn font-bold text-xs">41</button>
            </div>

            <div class="result-box p-4 border-round-xl border-1 surface-border">
                <span class="block text-600 font-medium mb-2">Resultado estimado (USD)</span>
                <div class="text-6xl font-bold text-900 mb-2">
                    {{ montoUSD | currency:'USD':'symbol':'1.2-2' }}
                </div>
                <span class="text-500 text-sm">Tasa actual: <span class="text-900 font-medium">1 USD ≈ 3.950 COP</span></span>
            </div>

            <div class="flex align-items-center justify-content-between mt-2">
                <div class="flex gap-2">
                    <p-button label="Limpiar" icon="pi pi-trash" [text]="true" severity="secondary" (onClick)="limpiar()"></p-button>
                    <p-button label="Historial" icon="pi pi-history" [text]="true" severity="secondary"></p-button>
                </div>
                <div class="flex gap-2">
                    <p-button label="Buscar" icon="pi pi-search" styleClass="px-4 py-2"></p-button>
                    <p-button label="Guardar" icon="pi pi-check-square" [outlined]="true" severity="secondary"></p-button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        /* Contenedor del Input personalizado */
        .custom-input-wrapper {
            border: 1px solid var(--surface-border);
            border-radius: 10px;
            padding: 4px 12px;
            background: #ffffff;
            transition: border-color 0.2s;
            &:focus-within {
                border-color: var(--primary-color);
            }
        }

        :host ::ng-deep .p-inputnumber-input {
            border: none !important;
            box-shadow: none !important;
            font-size: 1.2rem;
            font-weight: 500;
            background: transparent;
        }

        /* Botones circulares grises */
        .circle-btn {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            border: 1px solid var(--surface-border);
            background: var(--surface-50);
            color: var(--text-color-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s;
            &:hover {
                background: var(--surface-100);
            }
        }

        /* Caja de resultado */
        .result-box {
            background-color: var(--surface-50);
        }

        /* Ajuste de escala para el texto grande */
        .text-6xl {
            font-size: 3.5rem;
            letter-spacing: -2px;
        }
    `]
})
export class ConversorMonedaComponent {
    montoCOP: number | null = null;
    montoUSD: number = 0;
    tasaCambio: number = 3950;

    convertir() {
        if (this.montoCOP) {
            this.montoUSD = this.montoCOP / this.tasaCambio;
        } else {
            this.montoUSD = 0;
        }
    }

    limpiar() {
        this.montoCOP = null;
        this.montoUSD = 0;
    }
}