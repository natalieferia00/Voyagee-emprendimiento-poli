import { Component, OnInit, inject } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { TreeTableModule } from 'primeng/treetable';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ListaViajeService } from '../service/lista-viaje.service'; // Ajusta según tu carpeta

@Component({
  selector: 'app-lista-viaje',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TreeTableModule, 
    ButtonModule, DialogModule, InputTextModule, 
    ToolbarModule, TooltipModule
  ],
  templateUrl: './lista-viaje.html'
})
export class ListaViajeComponent implements OnInit {
  private listaService = inject(ListaViajeService);
  
  treeTableValue: TreeNode[] = [];
  selectedTreeTableValue: any = {};
  cols = [
    { field: 'name', header: 'Artículo' },
    { field: 'size', header: 'Cant.' },
    { field: 'type', header: 'Nota' }
  ];

  displayForm = false;
  isEditing = false;
  selectedNode: TreeNode | null = null;
  newNode = { name: '', size: '', type: '' };

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.listaService.getItems().subscribe({
      next: (res) => {
        this.treeTableValue = res.map(item => ({
          key: item._id,
          data: { name: item.name, size: item.size, type: item.type },
          children: []
        }));
        
        const selection: any = {};
        res.forEach(item => {
          if (item.completado) selection[item._id] = { checked: true, partialChecked: false };
        });
        this.selectedTreeTableValue = selection;
      }
    });
  }

  // --- FUNCIONES REQUERIDAS POR EL HTML ---

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
    const payload = { ...this.newNode };
    
    if (this.isEditing && this.selectedNode) {
      this.listaService.updateItem(this.selectedNode.key!, payload).subscribe(() => {
        this.loadItems();
        this.displayForm = false;
      });
    } else {
      this.listaService.saveItem({ ...payload, completado: false }).subscribe(() => {
        this.loadItems();
        this.displayForm = false;
      });
    }
  }

  deleteNode(node: TreeNode) {
    if (node.key) {
      this.listaService.deleteItem(node.key).subscribe(() => this.loadItems());
    }
  }

  onSelectionChange(event: any) {
    this.treeTableValue.forEach(node => {
      const isChecked = !!this.selectedTreeTableValue[node.key!];
      this.listaService.updateItem(node.key!, { ...node.data, completado: isChecked }).subscribe();
    });
  }

  isSelected(key: string | undefined): boolean {
    return !!(key && this.selectedTreeTableValue[key]?.checked);
  }
}