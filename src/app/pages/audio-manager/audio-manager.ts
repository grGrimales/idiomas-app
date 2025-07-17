import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhrasesService } from '../../services/phrases.service';
import { Playlist, Phrase, Translation } from '../../services/playlists.service';
import { DragAndDropDirective } from '../../shared/directives/drag-and-drop';
import { PlaylistsService } from '../../services/playlists.service';

@Component({
  selector: 'app-audio-manager',
  standalone: true,
  imports: [CommonModule, DragAndDropDirective, FormsModule],
  templateUrl: './audio-manager.html',
  styleUrls: ['./audio-manager.css']
})
export class AudioManagerComponent implements OnInit, OnDestroy {
  phrases: Phrase[] = [];
  playlists: Playlist[] = [];
  uploadingStatus: { [key: string]: boolean } = {};
  originUploadingStatus: { [phraseId: string]: boolean } = {};
  
  sortBy: string = 'createdAt_desc';
  selectedPlaylistId: string = '';

  private audioPlayer = new Audio();
  public currentlyPlayingUrl: string | null = null;

  constructor(
    private phrasesService: PhrasesService,
    private playlistsService: PlaylistsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadPhrases();
    this.playlistsService.getPlaylists().subscribe(data => this.playlists = data);

    this.audioPlayer.onended = () => {
      this.currentlyPlayingUrl = null;
      this.cdr.detectChanges();
    };
  }

  loadPhrases(): void {
    this.phrasesService.getPhrasesWithMissingAudio(this.sortBy, this.selectedPlaylistId).subscribe({
      next: (data: Phrase[]) => {
        this.phrases = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar las frases:', err)
    });
  }

  onOriginFileDropped(file: File, phrase: Phrase): void {
    if (!file.type.startsWith('audio/')) {
      alert('Por favor, suelta un archivo de audio válido.');
      return;
    }
    this.originUploadingStatus[phrase._id] = true;
    this.cdr.detectChanges();
    this.phrasesService.uploadOriginAudio(phrase._id, file).subscribe({
      next: (updatedPhrase) => {
        this.originUploadingStatus[phrase._id] = false; // <-- CORRECCIÓN AQUÍ
        this.handleUpdatedPhrase(updatedPhrase);
      },
      error: (err) => {
        this.originUploadingStatus[phrase._id] = false; // <-- CORRECCIÓN AQUÍ
        console.error('Error al subir el audio original', err);
        alert('Hubo un error al subir el archivo. Inténtalo de nuevo.');
        this.cdr.detectChanges();
      },
    });
  }

  onFileDropped(file: File, phraseId: string, translationIndex: number, gender: string): void {
    const uploadKey = `${phraseId}-${translationIndex}-${gender}`;
    if (!file.type.startsWith('audio/')) {
      alert('Por favor, suelta un archivo de audio válido.');
      return;
    }
    this.uploadingStatus[uploadKey] = true;
    this.cdr.detectChanges();
    this.phrasesService.uploadAudio(phraseId, translationIndex, gender, file).subscribe({
      next: (updatedPhrase: Phrase) => {
        this.uploadingStatus[uploadKey] = false; // <-- CORRECCIÓN AQUÍ
        this.handleUpdatedPhrase(updatedPhrase);
      },
      error: (err: any) => {
        this.uploadingStatus[uploadKey] = false; // <-- CORRECCIÓN AQUÍ
        console.error(`Error al subir el audio para ${uploadKey}:`, err);
        alert('Hubo un error al subir el archivo. Inténtalo de nuevo.');
        this.cdr.detectChanges();
      }
    });
  }
  
  deleteAudio(phraseId: string, translationIndex: number, gender: string): void {
    if (!confirm('¿Estás seguro de que quieres eliminar este audio? Esta acción no se puede deshacer.')) {
      return;
    }
    this.phrasesService.deleteAudio(phraseId, translationIndex, gender).subscribe({
      next: (updatedPhrase) => this.handleUpdatedPhrase(updatedPhrase),
      error: (err) => console.error('Error al eliminar el audio', err)
    });
  }

  // Este método ahora solo se encarga de actualizar la lista de frases
  private handleUpdatedPhrase(updatedPhrase: Phrase): void {
    const stillHasPendingAudio = updatedPhrase.originAudioUrl === 'audio.pendiente.mp3' ||
      updatedPhrase.translations.some(t => t.audios.some(a => a.audioUrl === 'audio.pendiente.mp3'));
    
    const index = this.phrases.findIndex(p => p._id === updatedPhrase._id);
    if (index !== -1) {
      if (stillHasPendingAudio) {
        this.phrases[index] = updatedPhrase;
      } else {
        this.phrases.splice(index, 1);
      }
    }
    this.cdr.detectChanges();
  }

  isUploading(phraseId: string, translationIndex: number, gender: string): boolean {
    const uploadKey = `${phraseId}-${translationIndex}-${gender}`;
    return this.uploadingStatus[uploadKey] || false;
  }
  
  isOriginUploading(phraseId: string): boolean {
    return this.originUploadingStatus[phraseId] || false;
  }

  getAudioUrl(translation: Translation, gender: string): string | null {
    const audio = translation.audios.find(a => a.gender === gender);
    return (audio && audio.audioUrl !== 'audio.pendiente.mp3') ? audio.audioUrl : null;
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
    this.cdr.detectChanges();
  }

  isPlaying(url: string | null): boolean {
    return this.currentlyPlayingUrl === url;
  }
 
  ngOnDestroy(): void {
    this.audioPlayer.pause();
    this.audioPlayer.onended = null;
  }
}