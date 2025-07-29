import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleSheetService } from '../../services/GoogleSheetService';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  standalone: true,
  selector: 'app-relax',
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './relax.html',
  styleUrls: ['./relax.css'],
})
export class Relax implements OnInit {

  hojaSeleccionada: string = 'lucia';
  hojasDisponibles: string[] = ['lucia', 'carlos_grediana'];
  datos: any[] = [];
  indiceActual = 0;
  etapa = 0; // 0: español, 1: hope, 2: thomas
  reproducirEspanol = true;
  tiempoEsperaSegundos = 0.75;

  etapasItem: string[] = [];
  etapaActualIndex = 0;

  gruposDisponibles: string[] = [];
  categoriasDisponibles: string[] = [];

  gruposSeleccionados: string[] = [];
  categoriasSeleccionadas: string[] = [];

  reproduccionActiva = false;

  repeticionesHope = 1;
  repeticionesThomas = 1;

  conteoRepeticiones = 0;

  ordenAleatorio = false;
  mostrarFormulario = true;











  @ViewChild('player', { static: false }) playerRef!: ElementRef<HTMLAudioElement>;

  constructor(private sheetService: GoogleSheetService) { }

  ngOnInit(): void {
    this.sheetService.getCsvData(this.hojaSeleccionada).subscribe((res) => {
      this.datos = res;

      this.gruposDisponibles = [...new Set(this.datos.map(item => item.grupo))];
      this.categoriasDisponibles = [...new Set(this.datos.map(item => item.categoria))];
      this.aplicarFiltros();

      //  setTimeout(() => this.reproducirActual(), 0);
    });

    this.generarEtapasParaItemActual();

  }

  cargarDatosDesdeHoja() {
    this.sheetService.getCsvData(this.hojaSeleccionada).subscribe((res) => {
      this.datos = res;
      this.gruposDisponibles = [...new Set(this.datos.map(item => item.grupo))];
      this.categoriasDisponibles = [...new Set(this.datos.map(item => item.categoria))];
      this.aplicarFiltros();
    });
  }
  reproducirActual() {
    if (!this.datos.length) return;

    if (!this.datosFiltrados.length) return;

    const item = this.datosFiltrados[this.indiceActual];


    const etapa = this.etapasItem[this.etapaActualIndex];

    const player = this.playerRef.nativeElement;
    let src = '';

    if (etapa === 'espanol') src = item['audio-espanol'];
    else src = item['audio-ingles-' + etapa]; // hope o thomas

    player.src = src;
    player.load();
    player.play();
  }


  siguienteEtapa() {
    this.etapaActualIndex++;

    if (this.etapaActualIndex >= this.etapasItem.length) {
      this.indiceActual++;

      if (this.indiceActual >= this.datosFiltrados.length) {
        this.indiceActual = 0;
      }


      this.etapaActualIndex = 0;
      this.generarEtapasParaItemActual();
    }

    setTimeout(() => this.reproducirActual(), this.tiempoEsperaSegundos * 1000);
  }




  generarEtapasParaItemActual() {
    this.etapasItem = [];

    if (this.reproducirEspanol) {
      this.etapasItem.push('espanol');
    }

    for (let i = 0; i < this.repeticionesHope; i++) {
      this.etapasItem.push('hope');
    }

    for (let i = 0; i < this.repeticionesThomas; i++) {
      this.etapasItem.push('thomas');
    }
  }

  datosFiltrados: any[] = [];


  shuffleArray(array: any[]): any[] {
    return array
      .map(item => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
  }



  aplicarFiltros() {
    this.datosFiltrados = this.datos.filter(item => {
      const grupoValido =
        this.gruposSeleccionados.length === 0 ||
        this.gruposSeleccionados.includes(item.grupo);
      const categoriaValida =
        this.categoriasSeleccionadas.length === 0 ||
        this.categoriasSeleccionadas.includes(item.categoria);
      return grupoValido && categoriaValida;
    });

    // 👉 Aplica orden aleatorio si está activado
    if (this.ordenAleatorio) {
      this.datosFiltrados = this.shuffleArray(this.datosFiltrados);
    }

    this.indiceActual = 0;
    this.etapaActualIndex = 0;

    if (this.reproduccionActiva && this.datosFiltrados.length) {
      this.generarEtapasParaItemActual();
      this.reproducirActual();
    }
  }




  onGrupoToggle(event: Event, grupo: string) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.gruposSeleccionados.push(grupo);
    } else {
      this.gruposSeleccionados = this.gruposSeleccionados.filter(g => g !== grupo);
    }

    this.aplicarFiltros();
  }

  iniciarReproduccion() {
    if (!this.datosFiltrados.length) return;

    this.reproduccionActiva = true;
    this.indiceActual = 0;
    this.etapaActualIndex = 0;
    this.generarEtapasParaItemActual();
    this.reproducirActual();
  }

  pausarReproduccion() {
    this.reproduccionActiva = false;
    this.playerRef?.nativeElement.pause();
  }


  reanudarReproduccion() {
    this.reproduccionActiva = true;
    this.reproducirActual();
  }

  getNombreEtapa(etapa: string): string {
    const mapa: Record<string, string> = {
      'espanol': 'Español',
      'hope': 'Hope',
      'thomas': 'Thomas',
    };
    return mapa[etapa] ?? etapa;
  }


}
