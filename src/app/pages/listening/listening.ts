import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleSheetService } from '../../services/GoogleSheetService';

@Component({
  standalone: true,
  selector: 'app-listening',
  imports: [CommonModule, FormsModule],
  templateUrl: './listening.html',
})
export class Listening implements OnInit {
  data: any[] = [];
  resultadosFiltrados: any[] = [];
  vocesSeleccionadas: string[] = ['hope' , 'thomas']; 


  grupos: string[] = [];
  categorias: string[] = [];
  niveles: string[] = [];
  repasarLuciaOptions: string[] = [];

  hojasDisponibles = ['lucia', 'carlos_grediana'];
  hojaSeleccionada = 'lucia';

  // Valores seleccionados
  grupoSeleccionado = '';
  categoriaSeleccionada = '';
  nivelSeleccionado = '';
  repasarLuciaSeleccionado = '';

  constructor(private sheetService: GoogleSheetService) { }

  ngOnInit() {

    this.cargarDatos(this.hojaSeleccionada);
   
  }

  cargarDatos(hoja: string) {
    this.sheetService.getCsvData(hoja).subscribe((res) => {
      this.data = res;

      this.grupos = [...new Set(this.data.map(item => item['grupo']))];
      this.categorias = [...new Set(this.data.map(item => item['categoria']))];
      this.niveles = [...new Set(this.data.map(item => item['nivel']))];
      this.repasarLuciaOptions = [...new Set(this.data.map(item => item['repasar-lucia']))];

      this.resultadosFiltrados = [...this.data];
    });
  }

  onSelectHojaChange() {
    this.cargarDatos(this.hojaSeleccionada);
  }

  filtrar() {
    this.resultadosFiltrados = this.data.filter((item) => {
      return (
        (!this.grupoSeleccionado || item['grupo'] === this.grupoSeleccionado) &&
        (!this.categoriaSeleccionada || item['categoria'] === this.categoriaSeleccionada) &&
        (!this.nivelSeleccionado || item['nivel'] === this.nivelSeleccionado) &&
        (!this.repasarLuciaSeleccionado || item['repasar-lucia'] === this.repasarLuciaSeleccionado)
      );
    });
  }

  toggleVoz(voz: string, checked: boolean) {
    if (checked) {
      this.vocesSeleccionadas.push(voz);
    } else {
      this.vocesSeleccionadas = this.vocesSeleccionadas.filter(v => v !== voz);
    }
  }

  onCheckboxChange(event: Event, voz: string) {
    const input = event.target as HTMLInputElement;
    this.toggleVoz(voz, input.checked);
  }

  mostrarFiltros = true;

  alternarFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }



}
