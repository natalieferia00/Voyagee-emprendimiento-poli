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
import { TooltipModule } from 'primeng/tooltip'; // Opcional para iconos

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
            label="Agregar"
            styleClass="p-button-success"
            (click)="showForm()"
          ></p-button>
        </div>
      </p-toolbar>

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
              <th style="width: 10rem">Acciones</th>
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
              <td>
                <div class="flex gap-2">
                  <p-button icon="pi pi-pencil" styleClass="p-button-text p-button-warning" (click)="editNode(rowNode.node)"></p-button>
                  <p-button icon="pi pi-trash" styleClass="p-button-text p-button-danger" (click)="deleteNode(rowNode.node)"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-treetable>
      </div>

      <p-dialog
        [header]="isEditing ? 'Editar Artículo' : 'Agregar nuevo Articulo'"
        [(visible)]="displayForm"
        [modal]="true"
        [style]="{ width: '20rem' }"
      >
        <div class="flex flex-col gap-3">
          <div>
            <label class="block mb-1 font-medium">Articulo</label>
            <input pInputText class="w-full" [(ngModel)]="newNode.name" />
          </div>
          <div>
            <label class="block mb-1 font-medium">Cantidad</label>
            <input pInputText class="w-full" [(ngModel)]="newNode.size" />
          </div>
          <div>
            <label class="block mb-1 font-medium">Nota</label>
            <input pInputText class="w-full" [(ngModel)]="newNode.type" />
          </div>
          <div class="flex justify-end gap-2 mt-3">
            <p-button label="Cancelar" styleClass="p-button-text" (click)="displayForm = false"></p-button>
            <p-button label="Guardar" icon="pi pi-check" (click)="saveNode()"></p-button>
          </div>
        </div>
      </p-dialog>
    </div>
  `,
  styleUrls: ['./lista-viaje.scss'],
  providers: [NodeService]
})
export class ListaViajeComponent implements OnInit {
  treeTableValue: TreeNode[] = [];
  selectedTreeTableValue: any = {};
  cols: any[] = [];
  displayForm = false;
  isEditing = false;
  selectedNode: TreeNode | null = null;

  newNode = { name: '', size: '', type: '' };

  private nodeService = inject(NodeService);

  ngOnInit() {
    this.nodeService.getTreeTableNodes().then((files: any) => (this.treeTableValue = files));

    this.cols = [
      { field: 'name', header: 'Articulo' },
      { field: 'size', header: 'Cantidad' },
      { field: 'type', header: 'Nota' }
    ];
  }

  showForm() {
    this.isEditing = false;
    this.newNode = { name: '', size: '', type: '' };
    this.displayForm = true;
  }

  editNode(node: TreeNode) {
    this.isEditing = true;
    this.selectedNode = node;
    // Cargamos los datos actuales en el formulario
    this.newNode = { ...node.data };
    this.displayForm = true;
  }

  saveNode() {
    if (this.isEditing && this.selectedNode) {
      // Actualizar nodo existente
      this.selectedNode.data = { ...this.newNode };
    } else {
      // Agregar nuevo nodo
      const newItem: TreeNode = {
        key: Math.random().toString(36).substring(2, 9), // Generar key única
        data: { ...this.newNode },
        children: []
      };
      this.treeTableValue = [...this.treeTableValue, newItem];
    }
    this.displayForm = false;
  }

  deleteNode(node: TreeNode) {
    this.treeTableValue = this.recursiveDelete(this.treeTableValue, node);
  }

  // Función auxiliar para eliminar nodos en cualquier nivel de profundidad
  private recursiveDelete(nodes: TreeNode[], nodeToDelete: TreeNode): TreeNode[] {
    return nodes
      .filter(n => n !== nodeToDelete)
      .map(n => {
        if (n.children) {
          n.children = this.recursiveDelete(n.children, nodeToDelete);
        }
        return n;
      });
  }
}