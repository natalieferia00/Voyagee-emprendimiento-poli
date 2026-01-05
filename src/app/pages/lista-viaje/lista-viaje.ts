import { Component, inject, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { FormsModule } from '@angular/forms';
import { TreeTableModule } from 'primeng/treetable';
import { CommonModule } from '@angular/common';
import { NodeService } from '../service/node.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-lista-viaje',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TreeModule,
    TreeTableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToolbarModule
  ],
  template: `
    <div class="card">
      <!-- Encabezado con Toolbar -->
      <p-toolbar styleClass="mb-4">
        <div class="p-toolbar-group-left">
          <h2 class="font-semibold text-xl m-0">Checklist Equipaje</h2>
        </div>
        <div class="p-toolbar-group-right">
          <p-button
            icon="pi pi-plus"
            label="Agregar"
            styleClass="p-button-success"
            (click)="showForm()"
          ></p-button>
        </div>
      </p-toolbar>

     
    <!-- Tabla tipo árbol -->
    <div class="card mt-4">
      <p-treetable 
        [value]="treeTableValue" 
        [columns]="cols"
        selectionMode="checkbox" 
        [(selectionKeys)]="selectedTreeTableValue"
        dataKey="key"
        [scrollable]="true" 
        [tableStyle]="{ 'min-width': '50rem' }">

        <ng-template #header let-columns>
          <tr>
            <th *ngFor="let col of columns">
              {{ col.header }}
            </th>
          </tr>
        </ng-template>

        <ng-template #body let-rowNode let-rowData="rowData" let-columns="columns">
          <tr [ttRow]="rowNode" [ttSelectableRow]="rowNode">
            <td *ngFor="let col of columns; let i = index">
              <span class="flex items-center gap-2">
                <p-treeTableToggler [rowNode]="rowNode" *ngIf="i === 0"></p-treeTableToggler>
                <p-treeTableCheckbox [value]="rowNode" *ngIf="i === 0"></p-treeTableCheckbox>
                {{ rowData[col.field] }}
              </span>
            </td>
          </tr>
        </ng-template>

      </p-treetable>
    </div>

    <!-- Diálogo para agregar nuevo nodo -->
    <p-dialog
      header="Agregar nuevo Articulo"
      [(visible)]="displayForm"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '15rem' }"
    >
      <div class="flex flex-col gap-3">
        <div>
          <label class="block mb-1 font-medium">Articulo</label>
          <input pInputText type="text" [(ngModel)]="newNode.name" placeholder="Ej: camara" />
        </div>

        <div>
          <label class="block mb-1 font-medium">Cantidad</label>
          <input pInputText type="text" [(ngModel)]="newNode.size" placeholder="Ej: 20cm" />
        </div>

        <div>
          <label class="block mb-1 font-medium">Nota</label>
          <input pInputText type="text" [(ngModel)]="newNode.type" placeholder="Ej: camara digital" />
        </div>

        <div class="flex justify-end gap-2 mt-3">
          <p-button label="Cancelar" styleClass="p-button-text" (click)="displayForm = false"></p-button>
          <p-button label="Guardar" icon="pi pi-check" (click)="addNode()"></p-button>
        </div>
      </div>
    </p-dialog>
  `,
  styleUrls: ['./lista-viaje.scss'],
  providers: [NodeService]
})
export class ListaViajeComponent implements OnInit {
  treeValue: TreeNode[] = [];
  treeTableValue: TreeNode[] = [];
  selectedTreeValue: TreeNode[] = [];
  selectedTreeTableValue: any = {};
  cols: any[] = [];

  displayForm = false; 

  newNode = {
    name: '',
    size: '',
    type: ''
  };

  private nodeService = inject(NodeService);

  ngOnInit() {
    this.nodeService.getFiles().then((files) => (this.treeValue = files));
    this.nodeService.getTreeTableNodes().then((files: any) => (this.treeTableValue = files));

    this.cols = [
      { field: 'name', header: 'Articulo' },
      { field: 'size', header: 'Cantidad' },
      { field: 'type', header: 'Nota' }
    ];

    this.selectedTreeTableValue = {
      '0-0': { partialChecked: false, checked: true }
    };
  }

  showForm() {
    this.displayForm = true;
  }

  addNode() {
    if (this.newNode.name.trim()) {
      const newItem: TreeNode = {
        data: { ...this.newNode },
        children: []
      };

      this.treeValue.push(newItem);

      this.newNode = { name: '', size: '', type: '' };
      this.displayForm = false;
    }
  }
}
