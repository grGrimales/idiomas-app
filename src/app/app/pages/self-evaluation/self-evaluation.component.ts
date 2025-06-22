import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleSheetService } from '../../services/GoogleSheetService';
import { NgSelectModule } from '@ng-select/ng-select';

// Define la interfaz para una frase de evaluación
interface Phrase {
  id: number;
  espanol: string;
  ingles: string;
  grupo: string;
  categoria: string;
  audioEspanol: string; // URL del audio en español
  audioIngles: string; // URL del audio en inglés
  hasProblem: boolean;
  // problemCount: number; // Si se quisiera un conteo de fallos
}

@Component({
  selector: 'app-self-evaluation',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './self-evaluation.component.html',
  styleUrls: ['./self-evaluation.component.css'],
})
export class SelfEvaluationComponent implements OnInit {

  // Propiedades para la carga de datos y filtros
  datosOriginales: any[] = [];
  allPhrases: Phrase[] = []; // Lista maestra donde persistirá el estado 'hasProblem'
  hojaSeleccionada: string = 'lucia';
  hojasDisponibles: string[] = ['lucia', 'carlos_grediana'];

  gruposDisponibles: string[] = [];
  categoriasDisponibles: string[] = [];
  gruposSeleccionados: string[] = [];
  categoriasSeleccionadas: string[] = [];
  mostrarFiltros: boolean = true;

  // Propiedades para la evaluación
  currentRoundPhrases: Phrase[] = [];
  currentPhraseIndex: number = 0;
  evaluationStarted: boolean = false;
  evaluationComplete: boolean = false;
  // Nueva propiedad para controlar la visibilidad de la respuesta (inglés y audio inglés)
  showAnswer: boolean = false;

  constructor(private sheetService: GoogleSheetService) {}

  ngOnInit(): void {
    this.cargarDatosDesdeHoja();
  }

  cargarDatosDesdeHoja(): void {
    this.sheetService.getCsvData(this.hojaSeleccionada).subscribe(
      (res: any[]) => {
        this.datosOriginales = res;
        this.allPhrases = res.map((item, index) => ({
          id: index, // Asegúrate de que este ID sea único para cada frase
          espanol: item.espanol || '',
          ingles: item.ingles || '',
          grupo: item.grupo || '',
          categoria: item.categoria || '',
          audioEspanol: item['audio-espanol'] || '', // Ajusta el nombre de la columna según tu CSV
          audioIngles: item['audio-ingles-hope'] || '', // Ajusta el nombre de la columna según tu CSV
          hasProblem: false,
        }));

        this.gruposDisponibles = [...new Set(this.datosOriginales.map(item => item.grupo))].filter(Boolean);
        this.categoriasDisponibles = [...new Set(this.datosOriginales.map(item => item.categoria))].filter(Boolean);

        this.aplicarFiltros();
        this.evaluationStarted = false;
        this.evaluationComplete = false;
        this.showAnswer = false; // Resetear el estado de mostrar respuesta
      },
      (error) => {
        console.error('Error al cargar los datos de la hoja:', error);
        this.allPhrases = [];
        this.currentRoundPhrases = [];
        this.evaluationStarted = false;
        this.evaluationComplete = false;
        this.showAnswer = false;
      }
    );
  }

  aplicarFiltros(): void {
    let filteredData: Phrase[] = [...this.allPhrases];

    if (this.gruposSeleccionados.length > 0) {
      filteredData = filteredData.filter(item => this.gruposSeleccionados.includes(item.grupo));
    }

    if (this.categoriasSeleccionadas.length > 0) {
      filteredData = filteredData.filter(item => this.categoriasSeleccionadas.includes(item.categoria));
    }

    // Reinicia el estado hasProblem para las frases filtradas (solo las que se usarán en esta sesión de evaluación)
    // Es importante para que cada sesión de filtro comience de cero.
    filteredData.forEach(p => p.hasProblem = false);

    this.currentRoundPhrases = [...filteredData];
    this.shuffleArray(this.currentRoundPhrases); // Mezcla las frases para la primera ronda
    this.currentPhraseIndex = 0;
    this.evaluationStarted = false;
    this.evaluationComplete = false;
    this.showAnswer = false; // Ocultar respuesta
  }

  startEvaluation(): void {
    if (this.currentRoundPhrases.length === 0) {
      this.evaluationComplete = true;
      this.evaluationStarted = false;
      return;
    }
    this.evaluationStarted = true;
    this.evaluationComplete = false;
    this.currentPhraseIndex = 0;
    this.showAnswer = false; // Asegurar que la respuesta esté oculta al iniciar
    // No reseteamos hasProblem aquí, eso se hace en aplicarFiltros
    this.shuffleArray(this.currentRoundPhrases); // Asegurarse de que esté aleatorio al inicio
  }


  // Lógica para el botón "Evaluar" / "Siguiente Frase"
  handleEvaluationStep(): void {
    if (!this.showAnswer) {
      // Si la respuesta no está visible, mostrarla
      this.showAnswer = true;
    } else {
      // Si la respuesta ya está visible, pasar a la siguiente frase
      // Primero, actualiza el estado 'hasProblem' en la lista maestra 'allPhrases'
      // para la frase que acaba de ser evaluada.
      const currentPhrase = this.getCurrentPhrase();
      if (currentPhrase) {
          const masterPhrase = this.allPhrases.find(p => p.id === currentPhrase.id);
          if (masterPhrase) {
              masterPhrase.hasProblem = currentPhrase.hasProblem;
          }
      }

      // Avanza al siguiente índice
      this.currentPhraseIndex++;
      this.showAnswer = false; // Ocultar la respuesta para la próxima frase

      if (this.currentPhraseIndex >= this.currentRoundPhrases.length) {
        // Si hemos llegado al final de la ronda, iniciar la siguiente ronda
        this.startNextRound();
      }
    }
  }


  startNextRound(): void {
    // Las propiedades 'hasProblem' de las frases de la ronda anterior ya se copiaron a allPhrases
    // en handleEvaluationStep()

    // Filtra solo las frases que tuvieron problemas en la lista maestra
    const phrasesForNextRound = this.allPhrases.filter(p => p.hasProblem);

    if (phrasesForNextRound.length === 0) {
      this.evaluationComplete = true; // Todas las frases han sido dominadas
      this.evaluationStarted = false;
      return;
    }

    this.currentRoundPhrases = [...phrasesForNextRound];
    // Reinicia 'hasProblem' para la siguiente ronda para que el usuario las re-evalúe
    this.currentRoundPhrases.forEach(p => p.hasProblem = false);
    this.shuffleArray(this.currentRoundPhrases); // Mezcla las frases para la nueva ronda
    this.currentPhraseIndex = 0;
    this.evaluationComplete = false;
    this.showAnswer = false; // Asegurar que la respuesta esté oculta al inicio de la nueva ronda
  }

  getCurrentPhrase(): Phrase | undefined {
    return this.currentRoundPhrases[this.currentPhraseIndex];
  }

  private shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  alternarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  // Reinicia completamente la evaluación
  resetEvaluation(): void {
    // Reinicia el estado hasProblem en todas las frases de la lista maestra
    this.allPhrases.forEach(p => p.hasProblem = false);
    this.evaluationComplete = false;
    this.evaluationStarted = false;
    this.currentPhraseIndex = 0;
    this.showAnswer = false; // Ocultar respuesta
    this.gruposSeleccionados = []; // Limpiar filtros al reiniciar
    this.categoriasSeleccionadas = []; // Limpiar filtros al reiniciar
    this.aplicarFiltros(); // Vuelve a aplicar los filtros (sin seleccionar ninguno si se limpiaron)
  }

  // Métodos para reproducir audio (si tienes un reproductor personalizado)
  playAudio(url: string): void {
    if (url) {
      const audio = new Audio(url);
      audio.play().catch(e => console.error('Error al reproducir audio:', e));
    } else {
      console.warn('URL de audio no disponible.');
    }
  }
}