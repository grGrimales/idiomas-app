import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlaylistsService, Playlist, Group } from '../../services/playlists.service';
import { PhrasesService } from '../../services/phrases.service';
import { AssessmentService } from '../../services/assessment.service';

@Component({
  selector: 'app-deep-study-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deep-study-setup.html',
})
export class DeepStudySetupComponent implements OnInit {
  playlists: Playlist[] = [];
  
  config = {
    playlistId: undefined,
    orderBy: 'least_studied',
    limit: 10,
    groupIds: [] as string[] 
  };

  allGroups: Group[] = [];
  selectedGroups: Group[] = [];
  groupSearchTerm: string = '';
  isDropdownOpen: boolean = false;
  
  constructor(
    private playlistsService: PlaylistsService,
    private phrasesService: PhrasesService,
    private assessmentService: AssessmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.playlistsService.getPlaylists().subscribe(data => this.playlists = data);
  }
  
  get filteredGroups(): Group[] {
    // Primero, obtenemos todos los grupos que aún no han sido seleccionados.
    const availableGroups = this.allGroups.filter(group => 
      !this.selectedGroups.find(sg => sg._id === group._id)
    );

    // Si no hay término de búsqueda, devolvemos esa lista completa.
    if (!this.groupSearchTerm) {
      return availableGroups;
    }

    // Si hay término de búsqueda, filtramos la lista que ya preparamos.
    return availableGroups.filter(group => {
      const groupName = group.name || '';
      return groupName.toLowerCase().includes(this.groupSearchTerm.toLowerCase());
    });
  }

  selectGroup(group: Group): void {
    this.selectedGroups.push(group);
    this.config.groupIds = this.selectedGroups.map(g => g._id);
    this.groupSearchTerm = '';
    this.isDropdownOpen = false;
  }

  removeGroup(groupToRemove: Group): void {
    this.selectedGroups = this.selectedGroups.filter(group => group._id !== groupToRemove._id);
    this.config.groupIds = this.selectedGroups.map(g => g._id);
  }

  getGroupsByPlaylistId(playlistId: string | undefined): void {
    this.allGroups = [];
    this.selectedGroups = [];
    this.config.groupIds = [];
    this.groupSearchTerm = '';

    if (playlistId) {
      this.playlistsService.getGroupsByPlaylistId(playlistId).subscribe(groups => {
        this.allGroups = groups;
      });
    }
  }

  closeDropdownWithDelay(): void {
    // Usamos un pequeño retraso para dar tiempo a que el clic en una opción se registre
    setTimeout(() => {
      this.isDropdownOpen = false;
    }, 200);
  }

  startStudySession(): void {
    this.phrasesService.createDeepStudySession(this.config).subscribe(phrases => {
      if (phrases && phrases.length > 0) {
        this.assessmentService.setPhrases(phrases);
        this.router.navigate(['/deep-study-view']);
      } else {
        alert('No se encontraron frases con los filtros seleccionados.');
      }
    });
  }
}