// src/app/pages/self-assessment/self-assessment.ts

import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhrasesService } from '../../services/phrases.service';
import { Phrase } from '../../services/playlists.service';
import { AssessmentService } from '../../services/assessment.service';
import { Router } from '@angular/router';
import { AssessmentResultsModalComponent } from '../../components/assessment-results-modal/assessment-results-modal';

@Component({
  selector: 'app-self-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule, AssessmentResultsModalComponent],
  templateUrl: './self-assessment.html',
  styleUrls: ['./self-assessment.css']
})
export class SelfAssessmentComponent implements OnInit, OnDestroy {
    sessionCorrectAnswers = 0;
  sessionIncorrectAnswers = 0;
  showResultsModal = false;
  private allPhrases: Phrase[] = [];
  private currentIndex = 0;

  currentPhrase: Phrase | null = null;
  userAnswer: string = '';
  // Actualizamos el tipo de 'feedback' para incluir la respuesta del usuario
  feedback: {
    correct: boolean;
    message: string;
    userAnswer: string; // <-- Nuevo
  } | null = null;
  isLoading: boolean = true;
  assessmentState: 'playing' | 'feedback' = 'playing';

  private audioPlayer = new Audio();

  constructor(
    private assessmentService: AssessmentService,
    private phrasesService: PhrasesService, // Lo mantenemos para las stats
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.assessmentService.phrases$.subscribe(phrases => {
      if (phrases.length === 0) {
        // Si no hay frases, redirigimos a la configuración
        this.router.navigate(['/assessment-setup']);
        return;
      }
      this.isLoading = false;
      this.allPhrases = phrases;
      this.loadNextPhrase();
    });
  }

 loadNextPhrase(): void {
    if (this.currentIndex < this.allPhrases.length) {
      this.currentPhrase = this.allPhrases[this.currentIndex];
      this.currentIndex++;
      
      this.userAnswer = '';
      this.feedback = null;
      this.assessmentState = 'playing';
      this.playOriginAudio();
    } else {
      // Se acabaron las frases, ¡mostramos el modal!
      this.showResultsModal = true;
    }
  }


  // REPRODUCE EL AUDIO DE ORIGEN (ESPAÑOL)
  playOriginAudio(): void {
    if (this.currentPhrase?.originAudioUrl) {
      this.audioPlayer.src = this.currentPhrase.originAudioUrl;
      this.audioPlayer.play();
    }
  }

  // REPRODUCE EL AUDIO DE LA TRADUCCIÓN (INGLÉS) POR GÉNERO
  playTranslationAudio(gender: 'femenino' | 'masculino'): void {
    const audio = this.currentPhrase?.translations[0]?.audios.find(a => a.gender === gender);
    if (audio?.audioUrl) {
      this.audioPlayer.src = audio.audioUrl;
      this.audioPlayer.play();
    }
  }

  checkAnswer(): void {
    if (!this.currentPhrase) return;

    const correctAnswer = this.currentPhrase.translations[0].translatedText.trim();
    const isCorrect = this.userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();


     if (isCorrect) {
      this.sessionCorrectAnswers++;
    } else {
      this.sessionIncorrectAnswers++;
    }


    this.phrasesService.updateAssessmentStats(this.currentPhrase._id, isCorrect).subscribe({
      next: () => console.log('Estadísticas actualizadas'),
      error: (err) => console.error('Error al actualizar estadísticas', err)
    });

    this.assessmentState = 'feedback';

    if (isCorrect) {
      this.feedback = {
        correct: true,
        message: '¡Correcto!',
        userAnswer: this.userAnswer // Guardamos la respuesta
      };
    } else {
      this.feedback = {
        correct: false,
        message: `La respuesta correcta es: "${correctAnswer}"`,
        userAnswer: this.userAnswer // Guardamos la respuesta
      };
    }
  }


   restartAssessment(): void {
    this.showResultsModal = false;
    this.router.navigate(['/assessment-setup']); // Vuelve a la configuración
  }
  
  closeModal(): void {
    this.showResultsModal = false;
    this.router.navigate(['/']); // Vuelve al inicio o dashboard
  }
  ngOnDestroy(): void {
    this.audioPlayer.pause();
  }
}