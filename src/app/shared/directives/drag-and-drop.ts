import { Directive, HostListener, HostBinding, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appDragAndDrop]',
  standalone: true,
})
export class DragAndDropDirective {
  // Emite un evento cuando un archivo es soltado
  @Output() fileDropped = new EventEmitter<File>();

  // Cambia el fondo del elemento cuando se arrastra un archivo sobre él
@HostBinding('style.background-color') background = '#f5fcff';
@HostBinding('style.opacity') opacity = '1';

  // Evento DragOver: se activa cuando un archivo está sobre la zona
  @HostListener('dragover', ['$event']) onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#9ecbec';
    this.opacity = '0.8';
  }

  // Evento DragLeave: se activa cuando el archivo sale de la zona
  @HostListener('dragleave', ['$event']) public onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#f5fcff';
    this.opacity = '1';
  }

  // Evento Drop: se activa cuando se suelta el archivo
  @HostListener('drop', ['$event']) public ondrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#f5fcff';
    this.opacity = '1';
    
    const files = evt.dataTransfer?.files;
    if (files && files.length > 0) {
      // Emitimos el primer archivo que se soltó
      this.fileDropped.emit(files[0]);
    }
  }
}