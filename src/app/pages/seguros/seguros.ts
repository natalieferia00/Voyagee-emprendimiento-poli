import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-seguros',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ToggleButtonModule,
    TagModule
  ],
  templateUrl: './seguros.html',
  styleUrls: ['./seguros.scss']
})
export class SegurosComponent {
  // ✅ Cambié el nombre de la variable para que coincida con el HTML
  precioCongelado = true;

  seguros = [
    {
      nombre: 'Viaje Seguro Plus',
      compania: 'Assist Card',
      cobertura: 'Médica + Pérdida de equipaje',
      destino: 'Europa',
      fechaInicio: '2025-12-01',
      fechaFin: '2025-12-20',
      estado: 'Vigente',
      url: 'https://www.assistcard.com/co',
      precio: 120.5
    },
    {
      nombre: 'Plan Global Travel',
      compania: 'Allianz',
      cobertura: 'Médica + Cancelación de vuelo',
      destino: 'Latinoamérica',
      fechaInicio: '2025-07-15',
      fechaFin: '2025-07-30',
      estado: 'Expirado',
      url: 'https://www.allianz-assistance.com',
      precio: 95.0
    },
    {
      nombre: 'Seguro Básico Axa',
      compania: 'AXA Assistance',
      cobertura: 'Médica',
      destino: 'Asia',
      fechaInicio: '2025-08-01',
      fechaFin: '2025-08-21',
      estado: 'Cotizado',
      url: 'https://www.axa-assistance.com',
      precio: 60.75
    }
  ];

  formatCurrency(value: number): string {
    return value.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP'
    });
  }
}
