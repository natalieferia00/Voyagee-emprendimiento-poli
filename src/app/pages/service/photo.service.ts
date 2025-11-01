import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor() { }

  // Método principal que retorna las imágenes de alojamientos
  getData() {
    return [
      {
        itemImageSrc: 'https://images.unsplash.com/photo-1501117716987-c8e1ecb2101f',
        thumbnailImageSrc: 'https://images.unsplash.com/photo-1501117716987-c8e1ecb2101f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
        alt: 'Hotel frente al mar con piscina y terraza tropical',
        title: 'Hotel Playa Dorada'
      },
      {
        itemImageSrc: 'https://images.unsplash.com/photo-1519821172141-b5d8e2f7f2c6',
        thumbnailImageSrc: 'https://images.unsplash.com/photo-1519821172141-b5d8e2f7f2c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
        alt: 'Cabaña de madera en la montaña rodeada de naturaleza',
        title: 'Cabaña Los Pinos'
      },
      {
        itemImageSrc: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461',
        thumbnailImageSrc: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
        alt: 'Apartamento moderno con vista urbana y ventanales grandes',
        title: 'Apartamento Urbano Central'
      },
      {
        itemImageSrc: 'https://images.unsplash.com/photo-1542317854-f9596ae570b6',
        thumbnailImageSrc: 'https://images.unsplash.com/photo-1542317854-f9596ae570b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
        alt: 'Glamping de lujo con domos en la montaña',
        title: 'Glamping Montaña Azul'
      },
      {
        itemImageSrc: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        thumbnailImageSrc: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
        alt: 'Hotel de estilo colonial en el centro histórico',
        title: 'Hostal Colonial Centro'
      },
      {
        itemImageSrc: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
        thumbnailImageSrc: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
        alt: 'Hotel campestre rodeado de naturaleza con piscina y spa',
        title: 'Hotel Campestre El Refugio'
      },
      {
        itemImageSrc: 'https://images.unsplash.com/photo-1590490360182-c33d57733427',
        thumbnailImageSrc: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
        alt: 'Bed & Breakfast con decoración artesanal y terraza panorámica',
        title: 'Casa Azul B&B'
      },
      {
        itemImageSrc: 'https://images.unsplash.com/photo-1613977257363-707ba9348227',
        thumbnailImageSrc: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
        alt: 'Apartamento con vista al mar y balcón privado',
        title: 'Apartamento Vista Verde'
      },
      {
        itemImageSrc: 'https://images.unsplash.com/photo-1620626011761-dc2b8a73e7e3',
        thumbnailImageSrc: 'https://images.unsplash.com/photo-1620626011761-dc2b8a73e7e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
        alt: 'Eco lodge en la selva tropical con hamacas y senderos naturales',
        title: 'Eco Lodge Río Verde'
      },
      {
        itemImageSrc: 'https://images.unsplash.com/photo-1613977257740-3dc9a457b2b6',
        thumbnailImageSrc: 'https://images.unsplash.com/photo-1613977257740-3dc9a457b2b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
        alt: 'Cabaña moderna junto a un lago con fogata exterior',
        title: 'Cabaña del Lago'
      },
      {
        itemImageSrc: 'https://images.unsplash.com/photo-1601918774946-25832a4be0d6',
        thumbnailImageSrc: 'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
        alt: 'Hotel boutique con decoración elegante y minimalista',
        title: 'Hotel Boutique La Luna'
      },
      {
        itemImageSrc: 'https://images.unsplash.com/photo-1590490360429-1b9bfc1d4b9a',
        thumbnailImageSrc: 'https://images.unsplash.com/photo-1590490360429-1b9bfc1d4b9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
        alt: 'Apartamento de lujo con cocina moderna y sala luminosa',
        title: 'Loft Ciudad del Sol'
      },
      {
        itemImageSrc: 'https://images.unsplash.com/photo-1560184897-60d204ef2a3a',
        thumbnailImageSrc: 'https://images.unsplash.com/photo-1560184897-60d204ef2a3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
        alt: 'Casa rural con jardín y piscina privada',
        title: 'Casa Campestre Los Almendros'
      },
      {
        itemImageSrc: 'https://images.unsplash.com/photo-1600047500633-3c90f9c21f8c',
        thumbnailImageSrc: 'https://images.unsplash.com/photo-1600047500633-3c90f9c21f8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
        alt: 'Hostal moderno con áreas comunes y coworking',
        title: 'Hostal Urban Vibes'
      },
      {
        itemImageSrc: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        thumbnailImageSrc: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
        alt: 'Glamping con carpas de lujo y vistas a la naturaleza',
        title: 'Glamping Tierra Serena'
      }
    ];
  }

  // Método auxiliar para simular una carga asíncrona (útil con PrimeNG)
  getImages() {
    return Promise.resolve(this.getData());
  }
}
