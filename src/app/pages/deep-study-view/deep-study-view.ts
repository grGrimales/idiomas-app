import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
import { Phrase } from '../../services/playlists.service';
import { StatisticsService } from '../../services/statistics.service';

@Component({
  selector: 'app-deep-study-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deep-study-view.html',
})
export class DeepStudyViewComponent implements OnInit, OnDestroy {
  private allPhrases: Phrase[] = [];
  private currentIndex = -1;
  currentPhrase: Phrase | null = null;
  isLoading = false;
  private audioPlayer = new Audio();

  // NUEVAS VARIABLES DE ESTADO
  isTranslationVisible = false; // Controla si se ve la traducción
  currentPlayingUrl: string | null = null; // Controla qué audio está sonando

  constructor(
    private assessmentService: AssessmentService,
    private statisticsService: StatisticsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.assessmentService.phrases$.subscribe(phrases => {
      if (phrases.length === 0) {
        this.router.navigate(['/deep-study-setup']);
        return;
      }
      this.allPhrases = phrases;
      this.nextPhrase();
    });
  }

  nextPhrase(): void {
    // 1. Detenemos cualquier audio que esté sonando antes de cambiar
    this.stopAudio();

    // 2. Reseteamos la visibilidad (siempre oculta al empezar frase nueva)
    this.isTranslationVisible = false;

    if (this.currentPhrase) {
      this.isLoading = true;
      this.statisticsService.incrementDeepStudyCount(this.currentPhrase._id).subscribe({
        complete: () => {
          this.loadNext();
          this.isLoading = false;
        },
        error: () => {
          this.loadNext();
          this.isLoading = false;
        }
      });
    } else {
      this.loadNext();
    }
  }

  private loadNext(): void {
    this.currentIndex++;
    if (this.currentIndex < this.allPhrases.length) {
      this.currentPhrase = this.allPhrases[this.currentIndex];
    } else {
      alert('¡Has terminado tu sesión de revisión profunda!');
      this.router.navigate(['/deep-study-setup']);
    }
  }

  // LÓGICA DE AUDIO ACTUALIZADA
  playAudio(url: string | undefined): void {
    if (!url) return;

    // Si le damos click al MISMO audio que está sonando, lo detenemos (toggle)
    if (this.currentPlayingUrl === url) {
      this.stopAudio();
      return;
    }

    // Si es un audio nuevo, detenemos el anterior y tocamos el nuevo
    this.stopAudio();

    this.currentPlayingUrl = url;
    this.audioPlayer.src = url;
    this.audioPlayer.loop = true; // AQUÍ ACTIVAMOS EL MODO INFINITO
    this.audioPlayer.play();
  }

  // Método auxiliar para detener y limpiar
  stopAudio(): void {
    this.audioPlayer.pause();
    this.audioPlayer.currentTime = 0;
    this.audioPlayer.loop = false;
    this.currentPlayingUrl = null;
  }

  ngOnDestroy(): void {
    this.stopAudio();
  }
}