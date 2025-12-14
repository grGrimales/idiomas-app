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
  phrases: Phrase[] = []; // Data original cargada de la API
  filteredPhrases: Phrase[] = []; // Data filtrada que se muestra en pantalla
  playlists: Playlist[] = [];

  // Variables para Grupos
  groups: string[] = [];
  selectedGroup: string = '';

  uploadingStatus: { [key: string]: boolean } = {};
  originUploadingStatus: { [phraseId: string]: boolean } = {};

  sortBy: string = 'createdAt_desc';
  selectedPlaylistId: string = '';

  private audioPlayer = new Audio();
  public currentlyPlayingUrl: string | null = null;

  showOnlyWithAudio: boolean = false;
  public copiedPhrases: { [key: string]: boolean } = {};

  // ordenar aleatoriamente
  showRandomOrder: boolean = false;

  constructor(
    private phrasesService: PhrasesService,
    private playlistsService: PlaylistsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadPhrases();
    this.playlistsService.getPlaylists().subscribe(data => {
      console.log('Playlists cargadas:', data);
      this.playlists = data;
    });
  }



  loadPhrases(): void {
    // 1. Cargar datos base (filtro de servidor/playlist)
    this.phrasesService.getPhrasesWithMissingAudio(this.sortBy, this.selectedPlaylistId).subscribe({
      next: (data: Phrase[]) => {

        // 2. Aplicar filtro de Audios (lógica de cliente)
        if (this.showOnlyWithAudio) {
          // Mostrar solo si tienen audios (ya sea origen o traducción)
          data = data.filter(phrase =>
            (phrase.originAudioUrl && phrase.originAudioUrl !== 'audio.pendiente.mp3') ||
            phrase.translations.some(t => t.audios.some(a => a.audioUrl && a.audioUrl !== 'audio.pendiente.mp3'))
          );
        } else {
          // Mostrar pendientes
          data = data.filter(phrase =>
            phrase.originAudioUrl === 'audio.pendiente.mp3' ||
            phrase.translations.some(t => t.audios.some(a => a.audioUrl === 'audio.pendiente.mp3'))
          );
        }

        // Ordenamiento Aleatorio
        if (this.showRandomOrder) {
          for (let i = data.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [data[i], data[j]] = [data[j], data[i]];
          }
        }

        // Guardamos la data procesada en 'phrases'
        this.phrases = data;
        console.log('Frases :', data);

        console.log('Frases filtradas por audio:', data.length);

        // 3. ACTUALIZAR GRUPOS (Esto repuebla el Select)
        this.extractGroups();

        // 4. Aplicar el filtro de grupo final a la vista
        this.filterByGroup();

        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar las frases:', err)
    });
  }

  extractGroups(): void {
    console.log('--- EXTRAYENDO GRUPOS ---');

    // 1. Mapeamos obteniendo el groupId (que vimos en el log que es lo que trae data)
    const rawGroups = this.phrases.map(p => p.groupId);

    // 2. Filtramos nulos y convertimos a STRING para evitar el error de .trim()
    const validGroups = rawGroups
      .filter(g => g !== undefined && g !== null) // Quitamos nulos
      .map(g => String(g)); // <--- ¡LA CLAVE! Convertimos 1 a "1"

    // 3. Set para únicos y ordenar
    this.groups = [...new Set(validGroups)].sort();

    console.log('Grupos finales (convertidos a texto):', this.groups);

    // 4. Resetear si el grupo seleccionado ya no existe
    if (this.selectedGroup && !this.groups.includes(this.selectedGroup)) {
      this.selectedGroup = '';
      this.filterByGroup();
    }
  }

  filterByGroup(): void {
    if (!this.selectedGroup || this.selectedGroup === '') {
      this.filteredPhrases = [...this.phrases];
    } else {
      // 5. Al filtrar, también convertimos el groupId de la frase a String para comparar
      this.filteredPhrases = this.phrases.filter(p => String(p.groupId) === this.selectedGroup);
    }
    console.log(`Filtrando por grupo "${this.selectedGroup}". Resultados: ${this.filteredPhrases.length}`);
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
        this.originUploadingStatus[phrase._id] = false;
        this.handleUpdatedPhrase(updatedPhrase);
      },
      error: (err) => {
        this.originUploadingStatus[phrase._id] = false;
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
        this.uploadingStatus[uploadKey] = false;
        this.handleUpdatedPhrase(updatedPhrase);
      },
      error: (err: any) => {
        this.uploadingStatus[uploadKey] = false;
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

  private handleUpdatedPhrase(updatedPhrase: Phrase): void {
    const stillHasPendingAudio = updatedPhrase.originAudioUrl === 'audio.pendiente.mp3' ||
      updatedPhrase.translations.some(t => t.audios.some(a => a.audioUrl === 'audio.pendiente.mp3'));

    // Actualizamos tanto en phrases (master) como en filteredPhrases (vista)
    const index = this.phrases.findIndex(p => p._id === updatedPhrase._id);

    if (index !== -1) {
      if (stillHasPendingAudio) {
        this.phrases[index] = updatedPhrase;
      } else {
        this.phrases.splice(index, 1);
      }
      // Re-aplicar filtro de grupo para mantener la vista sincronizada
      this.filterByGroup();
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
      this.audioPlayer.currentTime = 0;
      this.currentlyPlayingUrl = null;
    }
    else {
      this.audioPlayer.src = url;
      this.audioPlayer.loop = true;
      this.audioPlayer.load();
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

  copyToClipboard(text: string, phraseId: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedPhrases[phraseId] = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.copiedPhrases[phraseId] = false;
        this.cdr.detectChanges();
      }, 2000);
    }).catch(err => {
      console.error('Error al copiar texto al portapapeles: ', err);
      alert('No se pudo copiar el texto.');
    });
  }
}