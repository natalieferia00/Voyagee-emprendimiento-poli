import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class NodeService {

  constructor() {}

  // -----------------------------
  // MÉTODO PRINCIPAL PARA LA TABLA
  // -----------------------------
  getTreeTableNodes() {
    return Promise.resolve(this.getTreeTableNodesData());
  }

  getFiles() {
    return Promise.resolve(this.getFileSystemNodesData());
  }

  // ==============================
  //     DATA PARA TREE TABLE
  // ==============================
  getTreeTableNodesData(): TreeNode[] {
    return [
      {
        key: '0',
        data: { name: 'Bloqueador solar', size: '10g', type: 'Producto' },
        children: [
          {
            key: '0-0',
            data: { name: 'Maleta', size: '75kg', type: 'Producto' },
            children: [
              { key: '0-0-0', data: { name: 'angular.app', size: '10kb', type: 'Application' } },
              { key: '0-0-1', data: { name: 'native.app', size: '10kb', type: 'Application' } },
              { key: '0-0-2', data: { name: 'mobile.app', size: '5kb', type: 'Application' } }
            ]
          },
          { key: '0-1', data: { name: 'editor.app', size: '25kb', type: 'Application' } },
          { key: '0-2', data: { name: 'settings.app', size: '50kb', type: 'Application' } }
        ]
      },
      {
        key: '1',
        data: { name: 'Pasaporte', size: '1g', type: 'Documento' },
        children: [
          { key: '1-0', data: { name: 'backup-1.zip', size: '10kb', type: 'Zip' } },
          { key: '1-1', data: { name: 'backup-2.zip', size: '10kb', type: 'Zip' } }
        ]
      },
      {
        key: '2',
        data: { name: 'Laptop', size: '20g', type: 'Producto' },
        children: [
          { key: '2-0', data: { name: 'note-meeting.txt', size: '50kb', type: 'Text' } },
          { key: '2-1', data: { name: 'note-todo.txt', size: '100kb', type: 'Text' } }
        ]
      }
    ];
  }

  // ==============================
  //     DATA PARA LAZY NODES
  // ==============================
  lazyNodesData = [
    {
      label: 'Lazy Node 0',
      data: 'Node 0',
      expandedIcon: 'pi pi-folder-open',
      collapsedIcon: 'pi pi-folder',
      leaf: false
    },
    {
      label: 'Lazy Node 1',
      data: 'Node 1',
      expandedIcon: 'pi pi-folder-open',
      collapsedIcon: 'pi pi-folder',
      leaf: false
    },
    {
      label: 'Lazy Node 2',
      data: 'Node 2',
      expandedIcon: 'pi pi-folder-open',
      collapsedIcon: 'pi pi-folder',
      leaf: false
    }
  ];

  getLazyNodesData() {
    return this.lazyNodesData;
  }

  // ==============================
  //     DATA PARA FILE SYSTEM
  // ==============================
  fileSystemNodesData: TreeNode[] = [
    {
      data: { name: 'Bloqueador solar', size: '1', type: 'producto' },
      children: [
        {
          data: { name: 'Maleta', size: '70kg', type: 'producto' },
          children: [
            { data: { name: 'angular.app', size: '10mb', type: 'Application' } },
            { data: { name: 'cli.app', size: '10mb', type: 'Application' } },
            { data: { name: 'mobile.app', size: '5mb', type: 'Application' } }
          ]
        },
        { data: { name: 'editor.app', size: '25mb', type: 'Application' } },
        { data: { name: 'settings.app', size: '50mb', type: 'Application' } }
      ]
    },
    {
      data: { name: 'Gafas de sol', size: '1g', type: 'producto' },
      children: [
        { data: { name: 'backup-1.zip', size: '10mb', type: 'Zip' } },
        { data: { name: 'backup-2.zip', size: '10mb', type: 'Zip' } }
      ]
    }
  ];

  getFileSystemNodesData() {
    return this.fileSystemNodesData;
  }

}
