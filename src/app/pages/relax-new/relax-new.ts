import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Subscription } from 'rxjs';

// --- 👇 Asegúrate de importar 'Group' ---
import { Phrase, Playlist, Group } from '../../services/playlists.service';
import { PhrasesService } from '../../services/phrases.service';
import { PlaylistsService } from '../../services/playlists.service';

@Component({
  standalone: true,
  selector: 'app-relax-new',
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './relax-new.html',
})
export class RelaxNew implements OnInit, OnDestroy {
  // --- Propiedades existentes del componente ---
  public isPlaying = false;
  public settingsDone = false;
  public isPaused = false;
  private subscriptions: Subscription = new Subscription();
  public playlists: Playlist[] = [];
  public selectedPlaylistId: string | undefined = undefined;
  public order: 'random' | 'less-heard' = 'random';
  public limit = 10;
  // ... (otras propiedades existentes) ...
  public repeatSpanishAudio = true;
  public repeatCycles = 2;
  public phrases: Phrase[] = [];
  public currentPhraseIndex = 0;
  private currentAudio: HTMLAudioElement | null = null;
  private cycleCount = 0;
  private audioQueue: string[] = [];
  private audioQueueIndex = 0;

  // --- 👇 NUEVAS PROPIEDADES PARA EL SELECTOR DE GRUPOS ---
  public allGroups: Group[] = [];
  public selectedGroups: Group[] = [];
  public selectedGroupIds: string[] = [];
  public groupSearchTerm: string = '';
  public isDropdownOpen: boolean = false;

  constructor(
    private phrasesService: PhrasesService,
    private playlistsService: PlaylistsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const playlistsSub = this.playlistsService.getPlaylists().subscribe({
      next: (playlists: Playlist[]) => { this.playlists = playlists; },
    });
    this.subscriptions.add(playlistsSub);
  }

  ngOnDestroy(): void {
    this.stopAudio();
    this.subscriptions.unsubscribe();
  }

  // --- 👇 NUEVOS MÉTODOS PARA EL SELECTOR DE GRUPOS ---

  public onPlaylistChange(playlistId: any | undefined): void {
    this.allGroups = [];
    this.selectedGroups = [];
    this.selectedGroupIds = [];
    this.groupSearchTerm = '';

    if (playlistId) {

      this.playlistsService.getGroupsByPlaylistId(playlistId._id).subscribe(groups => {

        this.allGroups = groups;
      });
    }
  }

  get filteredGroups(): Group[] {
    const availableGroups = this.allGroups.filter(group =>
      !this.selectedGroups.find(sg => sg._id === group._id)
    );

    if (!this.groupSearchTerm) {
      return availableGroups;
    }

    return availableGroups.filter(group => {
      const groupName = group.name || '';
      return groupName.toLowerCase().includes(this.groupSearchTerm.toLowerCase());
    });
  }

  public selectGroup(group: Group): void {
    this.selectedGroups.push(group);
    this.selectedGroupIds = this.selectedGroups.map(g => g._id);
    this.groupSearchTerm = '';
    this.isDropdownOpen = false;
  }

  public removeGroup(groupToRemove: Group): void {
    this.selectedGroups = this.selectedGroups.filter(group => group._id !== groupToRemove._id);
    this.selectedGroupIds = this.selectedGroups.map(g => g._id);
  }

  public closeDropdownWithDelay(): void {
    setTimeout(() => {
      this.isDropdownOpen = false;
    }, 200);
  }

  // --- MÉTODOS EXISTENTES MODIFICADOS ---

  public startRelaxSession(): void {
    if (!this.selectedPlaylistId) {
      alert('Por favor, selecciona una playlist.');
      return;
    }
    this.settingsDone = true;
    this.isPlaying = true;
    this.isPaused = false;
    this.loadPhrases();
  }

  private loadPhrases(): void {
    const config = {
      playlistId: this.selectedPlaylistId,
      orderBy: this.order,
      limit: this.limit,
      groupIds: this.selectedGroupIds, // <-- 👇 Se añaden los IDs de los grupos
    };

    const phrasesSub = this.phrasesService.createRelaxSession(config).subscribe({
      // ... (resto del método sin cambios)
      next: (phrases) => {
        this.phrases = phrases;
        this.currentPhraseIndex = 0;
        if (this.phrases.length > 0) {
          this.playCurrentPhrase();
        } else {
          alert('No se encontraron frases con los filtros seleccionados.');
          this.changeSettings();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar frases:', err);
        alert('No se pudieron cargar las frases.');
        this.changeSettings();
      },
    });
    this.subscriptions.add(phrasesSub);
  }

  public changeSettings(): void {
    this.isPlaying = false;
    this.stopAudio();
    this.settingsDone = false;
    this.phrases = [];
    this.currentPhraseIndex = 0;

    // --- 👇 Se resetean las variables de grupos ---
    this.allGroups = [];
    this.selectedGroups = [];
    this.selectedGroupIds = [];
    this.groupSearchTerm = '';
  }

  // --- (resto de métodos como togglePause, playCurrentPhrase, etc., sin cambios) ---
  public togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.currentAudio?.pause();
    } else {
      if (this.currentAudio) {
        this.currentAudio.play().catch(e => console.error("Error al reanudar audio:", e));
      } else {
        this.playAudioQueue();
      }
    }
  }

  private playCurrentPhrase(): void {
    if (!this.phrases.length || this.currentPhraseIndex >= this.phrases.length) {
      this.loadPhrases();
      return;
    }
    const phrase = this.phrases[this.currentPhraseIndex];
    this.cycleCount = 0;
    this.playCycle(phrase);
  }

  private playCycle(phrase: Phrase): void {
    if (!this.isPlaying || this.isPaused || this.cycleCount >= this.repeatCycles) {
      if (this.cycleCount >= this.repeatCycles) this.moveToNextPhrase();
      return;
    }

    this.audioQueue = [];
    const femaleAudio = phrase.translations[0]?.audios.find(a => a.gender === 'femenino')?.audioUrl;
    const maleAudio = phrase.translations[0]?.audios.find(a => a.gender === 'masculino')?.audioUrl;

    if (this.repeatSpanishAudio && phrase.originAudioUrl && phrase.originAudioUrl !== 'audio.pendiente.mp3') {
      this.audioQueue.push(phrase.originAudioUrl);
    }

    if (femaleAudio && femaleAudio !== 'audio.pendiente.mp3') this.audioQueue.push(femaleAudio);
    if (maleAudio && maleAudio !== 'audio.pendiente.mp3') this.audioQueue.push(maleAudio);



    if (this.audioQueue.length === 0) {
      console.warn(`Sin audios válidos para: "${phrase.originalText}"`);
      this.moveToNextPhrase();
      return;
    }

    this.audioQueueIndex = 0;
    this.playAudioQueue(() => {
      this.cycleCount++;
      this.incrementStat(phrase._id);
      setTimeout(() => this.playCycle(phrase), 500);
    });
  }

  private playAudioQueue(onComplete: () => void = () => { }): void {
    if (this.isPaused || !this.isPlaying || this.audioQueueIndex >= this.audioQueue.length) {
      if (this.audioQueueIndex >= this.audioQueue.length) onComplete();
      return;
    }

    this.stopAudio(false);
    const audioUrl = this.audioQueue[this.audioQueueIndex];
    this.currentAudio = new Audio(audioUrl);

    this.currentAudio.play().catch(e => console.error("Error al reproducir audio:", e));
    this.currentAudio.onended = () => {
      this.audioQueueIndex++;
      this.playAudioQueue(onComplete);
    };
    this.currentAudio.onerror = () => {
      console.warn(`No se pudo reproducir: ${audioUrl}`);
      this.audioQueueIndex++;
      this.playAudioQueue(onComplete);
    };
  }

  private stopAudio(resetPauseState = true): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio.onended = null;
      this.currentAudio.onerror = null;
      this.currentAudio = null;
    }
    if (resetPauseState) {
      this.isPaused = false;
    }
  }

  public moveToNextPhrase(): void {
    this.currentPhraseIndex++;
    this.cdr.detectChanges();
    this.playCurrentPhrase();
  }

  private incrementStat(phraseId: string): void {
    this.phrasesService.incrementRelaxListen(phraseId).subscribe({
      error: (err) => console.error('Error al actualizar estadísticas:', err),
    });
  }
}