import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { TreeTableModule } from 'primeng/treetable';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-lista-viaje',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TreeTableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToolbarModule,
    TooltipModule
  ],
  template: `
    <div class="card">
      <p-toolbar styleClass="mb-4">
        <div class="p-toolbar-group-left">
          <h2 class="font-semibold text-xl m-0">Checklist Equipaje</h2>
        </div>
        <div class="p-toolbar-group-right">
          <p-button
            icon="pi pi-plus"
            label="Agregar Artículo"
            styleClass="p-button-success"
            (click)="showForm()"
          ></p-button>
        </div>
      </p-toolbar>

      <div class="card mt-4 p-0">
        <p-treeTable 
          [value]="treeTableValue" 
          [columns]="cols"
          selectionMode="checkbox" 
          [(selectionKeys)]="selectedTreeTableValue"
          (selectionKeysChange)="saveToLocalStorage()"
          dataKey="key"
          [scrollable]="true" 
          [tableStyle]="{ 'min-width': '40rem' }">

          <ng-template pTemplate="header" let-columns>
            <tr>
              <th *ngFor="let col of columns">
                {{ col.header }}
              </th>
              <th style="width: 8rem" class="text-center">Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-rowNode let-rowData="rowData" let-columns="columns">
            <tr [ttRow]="rowNode">
              <td *ngFor="let col of columns; let i = index">
                <span class="flex items-center gap-2">
                  <p-treeTableCheckbox [value]="rowNode" *ngIf="i === 0"></p-treeTableCheckbox>
                  
                  <span [ngClass]="{'line-through text-muted-color': isSelected(rowNode.node.key)}">
                    {{ rowData[col.field] }}
                  </span>
                </span>
              </td>
              <td class="text-center">
                <div class="flex justify-center gap-1">
                  <p-button icon="pi pi-pencil" styleClass="p-button-text p-button-warning p-button-sm" (click)="editNode(rowNode.node)"></p-button>
                  <p-button icon="pi pi-trash" styleClass="p-button-text p-button-danger p-button-sm" (click)="deleteNode(rowNode.node)"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td [attr.colspan]="cols.length + 1" class="text-center p-5 text-muted-color">
                No hay artículos en tu maleta. ¡Agrega el primero!
              </td>
            </tr>
          </ng-template>
        </p-treeTable>
      </div>

      <p-dialog
        [header]="isEditing ? 'Editar Artículo' : 'Nuevo Artículo'"
        [(visible)]="displayForm"
        [modal]="true"
        [style]="{ width: '22rem' }"
        [draggable]="false"
        [resizable]="false"
      >
        <div class="flex flex-col gap-4 mt-2">
          <div class="flex flex-col gap-1">
            <label for="name" class="font-medium">¿Qué llevas?</label>
            <input pInputText id="name" [(ngModel)]="newNode.name" placeholder="Ej. Pasaporte, Camisas..." />
          </div>
          <div class="flex flex-col gap-1">
            <label for="size" class="font-medium">Cantidad</label>
            <input pInputText id="size" [(ngModel)]="newNode.size" placeholder="Ej. 1, 3 pares..." />
          </div>
          <div class="flex flex-col gap-1">
            <label for="type" class="font-medium">Nota / Categoría</label>
            <input pInputText id="type" [(ngModel)]="newNode.type" placeholder="Ej. Importante, Ropa..." />
          </div>
        </div>
        <ng-template pTemplate="footer">
            <p-button label="Cancelar" styleClass="p-button-text" (click)="displayForm = false"></p-button>
            <p-button label="Guardar" icon="pi pi-check" (click)="saveNode()" [disabled]="!newNode.name"></p-button>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class ListaViajeComponent implements OnInit {
  treeTableValue: TreeNode[] = [];
  selectedTreeTableValue: any = {};
  cols: any[] = [];
  displayForm = false;
  isEditing = false;
  selectedNode: TreeNode | null = null;

  newNode = { name: '', size: '', type: '' };

  private readonly LS_ITEMS_KEY = 'checklist_viaje_items';
  private readonly LS_SELECTED_KEY = 'checklist_viaje_selected';

  ngOnInit() {
    this.cols = [
      { field: 'name', header: 'Artículo' },
      { field: 'size', header: 'Cant.' },
      { field: 'type', header: 'Nota' }
    ];
    this.loadFromLocalStorage();
  }

  loadFromLocalStorage() {
    const savedItems = localStorage.getItem(this.LS_ITEMS_KEY);
    const savedSelected = localStorage.getItem(this.LS_SELECTED_KEY);

    if (savedItems) {
      this.treeTableValue = JSON.parse(savedItems);
    }
    
    if (savedSelected) {
      this.selectedTreeTableValue = JSON.parse(savedSelected);
    }
  }

  saveToLocalStorage() {
    localStorage.setItem(this.LS_ITEMS_KEY, JSON.stringify(this.treeTableValue));
    localStorage.setItem(this.LS_SELECTED_KEY, JSON.stringify(this.selectedTreeTableValue));
  }

  showForm() {
    this.isEditing = false;
    this.newNode = { name: '', size: '', type: '' };
    this.displayForm = true;
  }

  editNode(node: TreeNode) {
    this.isEditing = true;
    this.selectedNode = node;
    this.newNode = { ...node.data };
    this.displayForm = true;
  }

  saveNode() {
    if (this.isEditing && this.selectedNode) {
      this.selectedNode.data = { ...this.newNode };
    } else {
      const newItem: TreeNode = {
        key: 'item_' + Date.now(),
        data: { ...this.newNode },
        children: []
      };
      this.treeTableValue = [...this.treeTableValue, newItem];
    }
    this.saveToLocalStorage();
    this.displayForm = false;
  }

  deleteNode(node: TreeNode) {
    this.treeTableValue = this.treeTableValue.filter(n => n.key !== node.key);
    
    // Limpiar selección si se elimina
    if (node.key && this.selectedTreeTableValue[node.key]) {
        delete this.selectedTreeTableValue[node.key];
        this.selectedTreeTableValue = { ...this.selectedTreeTableValue };
    }
    
    this.saveToLocalStorage();
  }

  isSelected(key: string | undefined): boolean {
    return !!(key && this.selectedTreeTableValue[key]?.checked);
  }
}