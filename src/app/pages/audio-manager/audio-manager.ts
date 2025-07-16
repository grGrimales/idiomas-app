// src/app/components/audio-manager/audio-manager.ts

import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhrasesService } from '../../services/phrases.service';
import { Phrase, Translation } from '../../services/playlists.service';
import { DragAndDropDirective } from '../../shared/directives/drag-and-drop';

@Component({
  selector: 'app-audio-manager',
  standalone: true,
  imports: [CommonModule, DragAndDropDirective],
  templateUrl: './audio-manager.html',
  styleUrls: ['./audio-manager.css']
})
export class AudioManagerComponent implements OnInit, OnDestroy {
  phrases: Phrase[] = [];
  uploadingStatus: { [key: string]: boolean } = {};
  
  // 👇 **NUEVO: Estado de carga para el audio de origen**
  originUploadingStatus: { [phraseId: string]: boolean } = {};

  private audioPlayer = new Audio();
  public currentlyPlayingUrl: string | null = null;

  constructor(
    private phrasesService: PhrasesService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.phrasesService.getPhrasesWithMissingAudio().subscribe({
      next: (data: Phrase[]) => {
        // Filtramos para asegurarnos de que solo mostramos frases que realmente necesitan audios
        this.phrases = data.filter(p => 
          p.originAudioUrl === 'audio.pendiente.mp3' || 
          p.translations.some(t => t.audios.some(a => a.audioUrl === 'audio.pendiente.mp3'))
        );
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar las frases:', err)
    });

    this.audioPlayer.onended = () => {
      this.currentlyPlayingUrl = null;
      this.cdr.detectChanges();
    };
  }

  // **MÉTODO PARA EL AUDIO DE ORIGEN**
  onOriginFileDropped(file: File, phrase: Phrase): void {
    if (!file.type.startsWith('audio/')) {
      alert('Por favor, suelta un archivo de audio válido.');
      return;
    }
    
    // **Activamos el estado de carga**
    this.originUploadingStatus[phrase._id] = true;
    this.cdr.detectChanges();

    this.phrasesService.uploadOriginAudio(phrase._id, file).subscribe({
      next: (updatedPhrase) => {
        const index = this.phrases.findIndex(p => p._id === updatedPhrase._id);
        if (index !== -1) {
          // Verificamos si la frase actualizada aún tiene audios pendientes
          const stillHasPendingAudio = updatedPhrase.translations.some(t =>
            t.audios.some(a => a.audioUrl === 'audio.pendiente.mp3')
          );
          if (stillHasPendingAudio) {
            this.phrases[index] = updatedPhrase;
          } else {
            // Si ya no tiene audios pendientes, la eliminamos de la lista
            this.phrases.splice(index, 1);
          }
        }
        // **Desactivamos el estado de carga**
        this.originUploadingStatus[phrase._id] = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al subir el audio original', err);
        alert('Hubo un error al subir el archivo. Inténtalo de nuevo.');
        // **Desactivamos el estado de carga en caso de error**
        this.originUploadingStatus[phrase._id] = false;
        this.cdr.detectChanges();
      },
    });
  }
  
  // **Verifica si el audio de origen se está subiendo**
  isOriginUploading(phraseId: string): boolean {
    return this.originUploadingStatus[phraseId] || false;
  }

  // --- Métodos existentes (sin cambios) ---

  onFileDropped(file: File, phraseId: string, translationIndex: number, gender: string): void {
    const uploadKey = `${phraseId}-${translationIndex}-${gender}`;
    if (!file.type.startsWith('audio/')) {
      alert('Por favor, suelta un archivo de audio válido.');
      return;
    }
    
    this.uploadingStatus[uploadKey] = true;
    this.phrasesService.uploadAudio(phraseId, translationIndex, gender, file).subscribe({
      next: (updatedPhrase: Phrase) => {
        // Comprobamos si el audio de origen también está pendiente
        const hasPendingOrigin = updatedPhrase.originAudioUrl === 'audio.pendiente.mp3';
        const hasPendingTranslations = updatedPhrase.translations.some(t =>
          t.audios.some(a => a.audioUrl === 'audio.pendiente.mp3')
        );

        const index = this.phrases.findIndex(p => p._id === updatedPhrase._id);
        if (index !== -1) {
          if (hasPendingOrigin || hasPendingTranslations) {
            this.phrases[index] = updatedPhrase;
          } else {
            this.phrases.splice(index, 1);
          }
        }
        this.uploadingStatus[uploadKey] = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(`Error al subir el audio para ${uploadKey}:`, err);
        alert('Hubo un error al subir el archivo. Inténtalo de nuevo.');
        this.uploadingStatus[uploadKey] = false;
        this.cdr.detectChanges();
      }
    });
  }

  isUploading(phraseId: string, translationIndex: number, gender: string): boolean {
    const uploadKey = `${phraseId}-${translationIndex}-${gender}`;
    return this.uploadingStatus[uploadKey] || false;
  }

  getAudioUrl(translation: Translation, gender: string): string | null {
    const audio = translation.audios.find(a => a.gender === gender);
    if (audio && audio.audioUrl !== 'audio.pendiente.mp3') {
      return audio.audioUrl;
    }
    return null;
  }

  playAudio(url: string | null) {
    if (!url) return;
    if (this.currentlyPlayingUrl === url) {
      this.audioPlayer.pause();
      this.currentlyPlayingUrl = null;
    } else {
      this.audioPlayer.src = url;
      this.audioPlayer.play();
      this.currentlyPlayingUrl = url;
    }
  }

  isPlaying(url: string | null): boolean {
    return this.currentlyPlayingUrl === url;
  }
 
  ngOnDestroy(): void {
    this.audioPlayer.pause();
    this.audioPlayer.onended = null;
  }
}