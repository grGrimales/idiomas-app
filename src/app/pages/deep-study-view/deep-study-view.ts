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

  constructor(
    private assessmentService: AssessmentService,
    private statisticsService: StatisticsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.assessmentService.phrases$.subscribe(phrases => {
      if (phrases.length === 0) {
        this.router.navigate(['/deep-study-setup']);
        return;
      }
      this.allPhrases = phrases;
      this.nextPhrase(); // Carga la primera frase
    });
  }

  nextPhrase(): void {
    // Si hay una frase actual, actualizamos su estadística ANTES de pasar a la siguiente
    if (this.currentPhrase) {
      this.isLoading = true;
      this.statisticsService.incrementDeepStudyCount(this.currentPhrase._id).subscribe({
        complete: () => {
          this.loadNext();
          this.isLoading = false;
        },
        error: () => { // Incluso si hay error, pasamos a la siguiente
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

  playAudio(url: string | undefined): void {
    if (url) {
      this.audioPlayer.src = url;
      this.audioPlayer.play();
    }
  }

  ngOnDestroy(): void {
    this.audioPlayer.pause();
  }
}